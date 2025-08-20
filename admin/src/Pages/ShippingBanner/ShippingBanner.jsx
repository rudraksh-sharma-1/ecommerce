import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  ActionIcon,
  Group,
  Button,
  TextInput,
  Switch,
  Modal,
  Image,
  FileInput,
  Loader,
  Notification
} from "@mantine/core";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaLink,
  FaEye,
  FaUpload
} from "react-icons/fa";
import { getshippingBanner, addShippingBanner, updateShippingBanner, deleteShippingBanner, toggleShippingBannerStatus } from '../../utils/supabaseApi';
import supabase from '../../utils/supabase';

const ShippingBanner = () => {
  const [banners, setBanners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: "", color: "" });

  const fetchBanners = async () => {
    setLoading(true);
    const result = await getshippingBanner();
    if (result.success) {
      setBanners(result.banners);
    } else {
      showNotification("Error loading shipping banners: " + result.error, "red");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showNotification = (message, color = "blue") => {
    setNotification({ visible: true, message, color });
    setTimeout(() => setNotification({ visible: false, message: "", color: "" }), 4000);
  };

  const openAddModal = () => {
    setCurrentBanner(null);
    setNewBanner({ title: "", active: true });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setCurrentBanner(banner);
    setNewBanner({ ...banner });
    setImageFile(null);
    setModalOpen(true);
  };

  const openPreviewModal = (banner) => {
    setCurrentBanner(banner);
    setPreviewModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!newBanner.title.trim()) {
      showNotification("Title is required", "red");
      return;
    }
    if (!currentBanner && !imageFile) {
      showNotification("Desktop image is required", "red");
      return;
    }

    setSaving(true);
    try {
      console.log('executing save banner', currentBanner, newBanner);
      if (currentBanner) {
        const result = await updateShippingBanner(currentBanner.id, newBanner, imageFile);
        console.log('result', result);
        if (result.success) {
          showNotification("Shipping Banner updated successfully", "green");
          fetchBanners();
        } else {
          showNotification("Error: " + result.error, "red");
        }
      } else {
        console.log('adding new banner', newBanner);
        const result = await addShippingBanner(newBanner, imageFile);
        console.log('result', result);
        if (result.success) {
          showNotification("Shipping Banner added successfully", "green");
          fetchBanners();
        } else {
          showNotification("Error: " + result.error, "red");
        }
      }
      setModalOpen(false);
    } catch (error) {
      showNotification("An unexpected error occurred", "red");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      const result = await deleteShippingBanner(id);
      if (result.success) {
        showNotification("Banner deleted successfully", "green");
        fetchBanners();
      } else {
        showNotification("Error deleting banner: " + result.error, "red");
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    // Determine the new status
    const newActiveStatus = !currentStatus;

    // Call the API function with the new status
    const result = await toggleShippingBannerStatus(id, newActiveStatus);

    if (result.success) {
      showNotification(`Banner status updated successfully`, "green");
      fetchBanners(); // Refresh the list to show the change
    } else {
      showNotification("Error updating status: " + result.error, "red");
    }
  };

  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Card shadow="sm" p="lg" radius="md">
        <Group position="apart" className="mb-4">
          <Title order={2}>Shipping Banner Management</Title>
          <Button icon={<FaPlus />} color="blue" onClick={openAddModal}>
            Add Shipping Banner
          </Button>
        </Group>

        <div className="overflow-x-auto">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th style={{ width: '220px', textAlign: 'center' }}>Banner</th>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td style={{ padding: '8px' }}>
                    <div style={{
                      width: '200px',
                      height: '130px',
                      margin: 'auto',
                      backgroundColor: '#f8f9fa', // A light background for letterboxing
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Image
                        src={banner.image_url}
                        alt={banner.title}
                        width={200}
                        height={130}
                        fit="contain" // This is equivalent to object-fit: contain
                        withPlaceholder
                      />
                    </div>
                  </td>
                  <td className="items-center" style={{
                    padding: '8px',
                    textAlign: 'center', // center content horizontally
                    verticalAlign: 'middle', // center content vertically
                  }}>{banner.title}</td>
                  <td className="items-center" style={{
                    padding: '8px',
                    textAlign: 'center', // center content horizontally
                    verticalAlign: 'middle', // center content vertically
                  }}><Switch
                      checked={banner.active}
                      // Pass both the id and the current status to the handler
                      onChange={() => toggleActive(banner.id, banner.active)}
                    /></td>
                  <td className="items-center " style={{
                    padding: '8px',
                    textAlign: 'center', // center content horizontally
                    verticalAlign: 'middle', // center content vertically
                  }}>
                    <Group spacing={8}>
                      <ActionIcon color="blue" onClick={() => openEditModal(banner)}><FaEdit size={16} /></ActionIcon>
                      <ActionIcon color="teal" onClick={() => openPreviewModal(banner)}><FaEye size={16} /></ActionIcon>
                      <ActionIcon color="red" onClick={() => handleDeleteBanner(banner.id)}><FaTrash size={16} /></ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={currentBanner ? "Edit Shipping Banner" : "Add Shipping Banner"} size="lg">
        <TextInput label="Title" placeholder="Banner Title" required value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} />
        <Switch label="Active" checked={newBanner.active} onChange={(e) => setNewBanner({ ...newBanner, active: e.currentTarget.checked })} mt="md" />
        <FileInput
          label="Banner Image"
          description="Recommended: 1200x200px"
          placeholder="Upload image"
          accept="image/*"
          onChange={setImageFile}
          mt="md"
        />
        <Group position="right" mt="lg">
          <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="blue" onClick={handleSaveBanner} loading={saving}>{currentBanner ? "Update Banner" : "Add Banner"}</Button>
        </Group>
      </Modal>

      <Modal opened={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title="Banner Preview" size="xl">
        {currentBanner && (
          <div>
            <Title order={4}>Desktop Preview</Title>
            <Image src={currentBanner.image_url} alt={currentBanner.title} />
            <Title order={4} mt="lg">Mobile Preview</Title>
            <Image src={currentBanner.mobile_image_url} alt={currentBanner.title} maw={320} mx="auto" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShippingBanner;