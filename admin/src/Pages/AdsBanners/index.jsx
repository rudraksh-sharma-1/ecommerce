import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Table,
  ActionIcon,
  Group,
  Button,
  TextInput,
  Switch,
  Modal,
  FileInput,
  Textarea,
  Loader,
  Notification,
  Image,
  Pagination
} from '@mantine/core';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaLink,
  FaEye,
  FaUpload
} from 'react-icons/fa';
import {
  getAllAdsBanners,
  addAdsBanner,
  updateAdsBanner,
  deleteAdsBanner,
  toggleAdsBannerStatus
} from '../../utils/supabaseApi';

const AdsBannersPage = () => {
  const [adsBanners, setAdsBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    link: '',
    image: null,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  const showNotification = (message, color = 'blue') => {
    setNotification({ visible: true, message, color });
    setTimeout(() => setNotification({ visible: false, message: '', color: '' }), 4000);
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await getAllAdsBanners();
      if (res.success) setAdsBanners(res.adsBanners);
      else showNotification(res.error, 'red');
    } catch (e) {
      showNotification('Error loading ads banners', 'red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const filtered = adsBanners.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const total = Math.ceil(filtered.length / itemsPerPage);
  const data = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openAdd = () => {
    setCurrentBanner(null);
    setNewBanner({ title: '', subtitle: '', link: '', image: null, active: true });
    setModalOpen(true);
  };
  const openEdit = b => {
    setCurrentBanner(b);
    setNewBanner({ ...b, image: null });
    setModalOpen(true);
  };
  const openPreview = b => {
    setCurrentBanner(b);
    setPreviewOpen(true);
  };

  const save = async () => {
    if (!newBanner.title.trim()) { showNotification('Title required', 'red'); return; }
    if (!currentBanner && !newBanner.image) { showNotification('Image required', 'red'); return; }
    setSaving(true);
    try {
      const fn = currentBanner ? updateAdsBanner : addAdsBanner;
      const args = currentBanner
        ? [currentBanner.id, newBanner, newBanner.image instanceof File ? newBanner.image : null]
        : [newBanner, newBanner.image instanceof File ? newBanner.image : null];
      const res = await fn(...args);
      if (res.success) {
        fetchBanners();
        showNotification(currentBanner ? 'Updated' : 'Added', 'green');
        setModalOpen(false);
      } else showNotification(res.error, 'red');
    } catch {
      showNotification('Error saving', 'red');
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm('Delete this banner?')) return;
    setLoading(true);
    try {
      const res = await deleteAdsBanner(id);
      if (res.success) {
        setAdsBanners(adsBanners.filter(b => b.id !== id));
        showNotification('Deleted', 'green');
      } else showNotification(res.error, 'red');
    } catch {
      showNotification('Error deleting', 'red');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, active) => {
    setLoading(true);
    try {
      const res = await toggleAdsBannerStatus(id, active);
      if (res.success) {
        setAdsBanners(adsBanners.map(b => (b.id === id ? { ...b, active } : b)));
        showNotification('Status updated', 'green');
      } else showNotification(res.error, 'red');
    } catch {
      showNotification('Error updating status', 'red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Group position="apart" mb="md">
        <Title order={3}>Ads Banners</Title>
        <Group>
          <TextInput
            placeholder="Search"
            icon={<FaSearch />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Button icon={<FaPlus />} onClick={openAdd}>Add</Button>
        </Group>
      </Group>
      {loading ? <Loader /> : (
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Link</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(b => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.subtitle}</td>
                <td><ActionIcon component="a" href={b.link}><FaLink /></ActionIcon></td>
                <td><Switch checked={b.active} onChange={() => toggleStatus(b.id, !b.active)} /></td>
                <td>
                  <Group spacing="xs">
                    <ActionIcon onClick={() => openPreview(b)}><FaEye /></ActionIcon>
                    <ActionIcon onClick={() => openEdit(b)}><FaEdit /></ActionIcon>
                    <ActionIcon color="red" onClick={() => remove(b.id)}><FaTrash /></ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Pagination page={page} onChange={setPage} total={total} mt="md" />

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={currentBanner ? 'Edit Banner' : 'Add Banner'}>
        <TextInput
          label="Title"
          value={newBanner.title}
          onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
          mb="sm"
        />
        <Textarea
          label="Subtitle"
          value={newBanner.subtitle}
          onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value })}
          mb="sm"
        />
        <TextInput
          label="Link"
          value={newBanner.link}
          onChange={e => setNewBanner({ ...newBanner, link: e.target.value })}
          mb="sm"
        />
        <FileInput
          label="Image"
          placeholder="Upload image"
          accept="image/*"
          onChange={file => setNewBanner({ ...newBanner, image: file })}
          mb="sm"
        />
        <Switch
          label="Active"
          checked={newBanner.active}
          onChange={e => setNewBanner({ ...newBanner, active: e.currentTarget.checked })}
          mb="sm"
        />
        <Group position="right">
          <Button loading={saving} onClick={save}>Save</Button>
        </Group>
      </Modal>

      <Modal opened={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview">
        <Image src={currentBanner?.image_url} alt={currentBanner?.title} />
      </Modal>

      <Notification
        visible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
        color={notification.color}
        title={notification.message}
      />
    </Card>
  );
};

export default AdsBannersPage;
