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
  Pagination,
  Select,
  FileInput,
  Textarea,
  Loader,
  Notification
} from "@mantine/core";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch,
  FaLink,
  FaEye,
  FaUpload
} from "react-icons/fa";


// Banner positions options
const BANNER_POSITIONS = [
  { value: "hero", label: "Hero Banner (Top)" },
  { value: "featured", label: "Featured Section" },
  { value: "sidebar", label: "Sidebar" },
  { value: "promo", label: "Promotional Banner" },
  { value: "category", label: "Category Banner" }
];

import {Link} from "react-router-dom";
import { getAllBanners, addBanner, updateBanner, deleteBanner, toggleBannerStatus } from '../../utils/supabaseApi'
import supabase from '../../utils/supabase'

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({ 
    title: "", 
    description: "",
    link: "", 
    active: true,
    position: "hero"
  });
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: "", color: "" });
  const itemsPerPage = 5;

  useEffect(() => {
    async function getBanners() {
      setLoading(true);
      const { data: banners, error } = await supabase.from('banners').select();
      if (error) {
        setNotification({ visible: true, message: error.message, color: 'red' });
      } else if (banners && banners.length > 0) {
        setBanners(banners);
      }
      setLoading(false);
    }
    getBanners();
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const result = await getAllBanners();
        if (result.success) {
          setBanners(result.banners);
        } else {
          showNotification("Error loading banners: " + result.error, "red");
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        showNotification("Error loading banners", "red");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Show notification helper
  const showNotification = (message, color = "blue") => {
    setNotification({ visible: true, message, color });
    setTimeout(() => setNotification({ visible: false, message: "", color: "" }), 4000);
  };

  // Filter banners based on search
  const filteredBanners = banners.filter(banner => 
    banner.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const paginatedBanners = filteredBanners.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const openAddModal = () => {
    setCurrentBanner(null);
    setNewBanner({ 
      title: "", 
      description: "",
      link: "", 
      active: true,
      position: "hero"
    });
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setCurrentBanner(banner);
    setNewBanner({ ...banner });
    setModalOpen(true);
  };

  const openPreviewModal = (banner) => {
    setCurrentBanner(banner);
    setPreviewModalOpen(true);
  };

  const handleSaveBanner = async () => {
    // Validation
    if (!newBanner.title.trim()) {
      showNotification("Banner title is required", "red");
      return;
    }

    if (!currentBanner && !newBanner.image) {
      showNotification("Banner image is required", "red");
      return;
    }
    
    setSaving(true);
    try {
      if (currentBanner) {
        // Update existing banner
        const result = await updateBanner(currentBanner.id, newBanner, newBanner.image instanceof File ? newBanner.image : null);
        if (result.success) {
          // Refresh banner list
          const updatedBanners = await getAllBanners();
          if (updatedBanners.success) {
            setBanners(updatedBanners.banners);
            showNotification("Banner updated successfully", "green");
          }
        } else {
          showNotification("Error updating banner: " + result.error, "red");
        }
      } else {
        // Add new banner
        const result = await addBanner(newBanner, newBanner.image instanceof File ? newBanner.image : null);
        if (result.success) {
          // Refresh banner list
          const updatedBanners = await getAllBanners();
          if (updatedBanners.success) {
            setBanners(updatedBanners.banners);
            showNotification("Banner added successfully", "green");
          }
        } else {
          showNotification("Error adding banner: " + result.error, "red");
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving banner:", error);
      showNotification("Error saving banner", "red");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setLoading(true);
      try {
        const result = await deleteBanner(id);
        if (result.success) {
          setBanners(banners.filter(banner => banner.id !== id));
          showNotification("Banner deleted successfully", "green");
        } else {
          showNotification("Error deleting banner: " + result.error, "red");
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        showNotification("Error deleting banner", "red");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (id) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    
    try {
      const result = await toggleBannerStatus(id, !banner.active);
      if (result.success) {
        setBanners(banners.map(ban => 
          ban.id === id ? { ...ban, active: !ban.active } : ban
        ));
        showNotification(`Banner ${!banner.active ? 'activated' : 'deactivated'} successfully`, "green");
      } else {
        showNotification("Error updating banner status: " + result.error, "red");
      }
    } catch (error) {
      console.error("Error toggling banner status:", error);
      showNotification("Error updating banner status", "red");
    }
  };

  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Card shadow="sm" p="lg" radius="md" className="mantine-card mb-6">
        <Group position="apart" className="mb-4">
          <Title order={2}>Banners Management</Title>
          <Button 
             icon={<FaPlus />} 
             color="blue"
             variant="filled"
             onClick={openAddModal}
          >
            Add New Banner
          </Button>
          <Link to={'/VideoBannerManagement'} className="underline">Go to Video Banner Management</Link>
        </Group>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <TextInput
            className="flex-1"
            placeholder="Search banners..."
            leftSection={<FaSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table striped highlightOnHover>
            <colgroup>
              <col style={{ width: 200, textAlign: 'center' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ width: 200, textAlign: 'center', verticalAlign: 'middle' }}>Banner</th>
                <th>Title</th>
                <th>Position</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBanners.map((banner) => (
                <tr key={banner.id}>
                  <td style={{ width: 200, textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ width: 200, height: 130, overflow: 'hidden', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', marginLeft: 'auto', marginRight: 'auto' }}>
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">#{String(banner.id).slice(-4)}</div>
                  </td>
                  <td>{banner.title}</td>
                  <td className="capitalize">{banner.position}</td>
                  <td>
                    <Switch 
                      checked={banner.active} 
                      onChange={() => toggleActive(banner.id)}
                      color="green"
                    />
                  </td>
                  <td>
                    <Group spacing={8}>
                      <ActionIcon 
                        color="blue"
                        onClick={() => openEditModal(banner)}
                      >
                        <FaEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        color="teal"
                        onClick={() => openPreviewModal(banner)}
                      >
                        <FaEye size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        color="red" 
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <FaTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              total={totalPages}
              value={activePage}
              onChange={setActivePage}
              size="sm"
              radius="md"
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Banner Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentBanner ? "Edit Banner" : "Add New Banner"}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Banner Title"
            placeholder="Enter banner title"
            required
            value={newBanner.title}
            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
          />

          <TextInput
            label="Redirect Link"
            placeholder="Enter redirect URL (e.g., /products/category)"
            leftSection={<FaLink size={14} />}
            value={newBanner.link}
            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
          />

          <Select
            label="Position"
            placeholder="Select banner position"
            required
            data={[
              { value: "hero", label: "Hero Section" },
              { value: "featured", label: "Featured Section" },
              { value: "sidebar", label: "Sidebar" },
              { value: "popup", label: "Popup" }
            ]}
            value={newBanner.position}
            onChange={(value) => setNewBanner({ ...newBanner, position: value })}
          />

          <div className="flex items-center mb-2">
            <Switch 
              label="Active" 
              checked={newBanner.active} 
              onChange={(event) => setNewBanner({
                ...newBanner,
                active: event.currentTarget.checked
              })}
              color="green"
            />
          </div>

          {typeof newBanner.image === 'string' && newBanner.image && (
            <div className="mb-4">
              <Text weight={500} size="sm" className="mb-2">Current Image</Text>
              <Image
                src={newBanner.image}
                alt={newBanner.title}
                radius="md"
                height={150}
                fit="contain"
              />
            </div>
          )}

          <FileInput
            label="Banner Image"
            placeholder="Upload banner image"
            accept="image/*"
            leftSection={<FaUpload size={14} />}
            onChange={(file) => setNewBanner({ ...newBanner, image: file })}
          />

          {newBanner.image instanceof File && (
            <div className="mb-4">
              <Text weight={500} size="sm" className="mb-2">Preview Image</Text>
              <Image
                src={URL.createObjectURL(newBanner.image)}
                alt={newBanner.title}
                radius="md"
                height={150}
                fit="contain"
              />
            </div>
          )}

          <Group position="right" spacing="md" className="mt-4">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSaveBanner}>
              {currentBanner ? "Update Banner" : "Add Banner"}
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Preview Banner Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Banner Preview"
        size="xl"
      >
        {currentBanner && (
          <div className="flex flex-col gap-4">
            <div className="aspect-[3/1] overflow-hidden rounded-md">
              <Image
                src={currentBanner.image}
                alt={currentBanner.title}
                height={300}
                fit="cover"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text weight={700} size="sm">Title</Text>
                <Text>{currentBanner.title}</Text>
              </div>
              
              <div>
                <Text weight={700} size="sm">Position</Text>
                <Text className="capitalize">{currentBanner.position}</Text>
              </div>
              
              <div>
                <Text weight={700} size="sm">Link</Text>
                <Text>{currentBanner.link}</Text>
              </div>
              
              <div>
                <Text weight={700} size="sm">Status</Text>
                <Text>{currentBanner.active ? "Active" : "Inactive"}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BannersPage;
