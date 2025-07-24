import {
  Card,
  Title,
  Group,
  Button,
  TextInput,
  Modal,
  Table,
  ActionIcon,
  Pagination,
  FileInput,
  Text,
  Switch,
} from "@mantine/core";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaUpload,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import {
  getAllVideoBanners,
  addVideoBanner,
  updateVideoBanner,
  deleteVideoBanner,
  toggleVideoBannerStatus,
} from "../../utils/supabaseApi.js";

const VideoBannerManagement = () => {
  const [videoBanners, setVideoBanners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    name: "",
    video_url: "",
    status: true,
  });
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5;

  const filtered = videoBanners.filter((b) =>
    b.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getAllVideoBanners();
    if (res.success) setVideoBanners(res.videoBanners);
  };

  const openAddModal = () => {
    setCurrentBanner(null);
    setNewBanner({ name: "", video_url: "", status: true });
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

  const handleSave = async () => {
    let res;
    if (currentBanner) {
      res = await updateVideoBanner(
        currentBanner.id,
        newBanner,
        newBanner.video_url instanceof File ? newBanner.video_url : null
      );
    } else {
      res = await addVideoBanner(
        newBanner,
        newBanner.video_url instanceof File ? newBanner.video_url : null
      );
    }

    if (res.success) {
      fetchData();
      setModalOpen(false);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await deleteVideoBanner(id);
    if (res.success) fetchData();
  };

  const toggleStatus = async (id) => {
    const banner = videoBanners.find((b) => b.id === id);
    const res = await toggleVideoBannerStatus(id, !banner.status);
    if (res.success) fetchData();
  };

  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Card shadow="sm" p="lg" radius="md" className="mantine-card mb-6">
        <Group position="apart" className="mb-4">
          <Title order={2}>Video Banners Management</Title>
          <Button icon={<FaPlus />} color="blue" onClick={openAddModal}>
            Add Video Banner
          </Button>
        </Group>

        <TextInput
          placeholder="Search video banners..."
          leftSection={<FaSearch />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="overflow-x-auto">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Preview</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((banner) => (
                <tr key={banner.id} className="text-center align-middle">
                  <td className="align-middle">{banner.name}</td>
                  <td className="align-middle pl-50">
                    <video
                      src={banner.video_url}
                      controls
                      className="rounded-md max-w-[200px] h-[100px] object-cover"
                    />
                  </td>
                  <td className="align-middle">
                    <Switch
                      checked={banner.status}
                      onChange={() => toggleStatus(banner.id)}
                      color="green"
                    />
                  </td>
                  <td className="align-middle">
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
                        onClick={() => handleDelete(banner.id)}
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

      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentBanner ? "Edit Video Banner" : "Add Video Banner"}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Name"
            placeholder="Enter video name"
            value={newBanner.name}
            onChange={(e) =>
              setNewBanner({ ...newBanner, name: e.target.value })
            }
            required
          />

          <Switch
            label="Status"
            checked={newBanner.status}
            onChange={(e) =>
              setNewBanner({ ...newBanner, status: e.currentTarget.checked })
            }
            color="green"
          />

          {typeof newBanner.video_url === "string" && (
            <video
              src={newBanner.video_url}
              controls
              className="rounded-md w-full h-48"
            />
          )}

          <FileInput
            label="Upload Video"
            accept="video/*"
            leftSection={<FaUpload />}
            onChange={(file) => setNewBanner({ ...newBanner, video_url: file })}
          />

          <Group position="right">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleSave}>
              {currentBanner ? "Update" : "Add"}
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Video Banner Preview"
        size="xl"
      >
        {currentBanner && (
          <div className="flex flex-col gap-4">
            <Text weight={700}>Name</Text>
            <Text>{currentBanner.name}</Text>

            <Text weight={700}>Status</Text>
            <Text>{currentBanner.status ? "Active" : "Inactive"}</Text>

            <video
              src={currentBanner.video_url}
              controls
              className="rounded-md w-full max-h-[400px]"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoBannerManagement;
