import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Title,
  Text,
  Table,
  ActionIcon,
  Group,
  Button,
  TextInput,
  Badge,
  Modal,
  Pagination,
  Select,
  Textarea,
  Loader,
  Paper,
  ScrollArea,
  Avatar,
  Divider,
  Tooltip,
} from "@mantine/core";
import {
  FaEye,
  FaTrash,
  FaSearch,
  FaComments,
  FaPaperPlane,
  FaUser,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  getAllEnquiries,
  getEnquiryWithReplies,
  addEnquiryReply,
  updateEnquiryStatus,
  deleteEnquiry,
  getAllUsersWithDetailedAddress,
} from "../../utils/supabaseApi";
import { formatDateIST } from "../../utils/dateUtils";

const EnquiryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [currentEnquiry, setCurrentEnquiry] = useState(null);
  const [enquiryReplies, setEnquiryReplies] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Handle direct chat opening from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const chatId = searchParams.get('chatId');
    
    if (chatId && enquiries.length > 0) {
      const enquiry = enquiries.find(e => e.id === chatId);
      if (enquiry) {
        openChatModal(enquiry);
        // Clear the URL parameter
        navigate('/enquiry', { replace: true });
      }
    }
  }, [location.search, enquiries]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const result = await getAllEnquiries();
      if (result.success) {
        setEnquiries(result.enquiries);
      } else {
        console.error("Error loading enquiries:", result.error);
      }
    } catch (err) {
      console.error("Error loading enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) =>
    items?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0) || 0;

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const q = searchQuery.toLowerCase();
    return (
      // Exclude custom printing enquiries from regular enquiries tab
      enquiry.type !== "custom_printing" &&
      (enquiry.name?.toLowerCase().includes(q) ||
        enquiry.email?.toLowerCase().includes(q) ||
        enquiry.message?.toLowerCase().includes(q) ||
        enquiry.phone?.toLowerCase().includes(q)) &&
      (statusFilter === "" || enquiry.status === statusFilter)
    );
  });

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const paginatedEnquiries = filteredEnquiries.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const openViewModal = (enquiry) => {
    setCurrentEnquiry(enquiry);
    setViewModalOpen(true);
  };

  const openChatModal = async (enquiry) => {
    try {
      const result = await getEnquiryWithReplies(enquiry.id);
      if (result.success) {
        setCurrentEnquiry(result.enquiry);
        setEnquiryReplies(result.enquiry.enquiry_replies || []);
        setChatModalOpen(true);
      } else {
        console.error("Error loading enquiry replies:", result.error);
      }
    } catch (err) {
      console.error("Error loading enquiry replies:", err);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const result = await addEnquiryReply(
        currentEnquiry.id,
        replyMessage.trim(),
        true
      );
      if (result.success) {
        setEnquiryReplies([...enquiryReplies, result.reply]);
        setReplyMessage("");
        setEnquiries(
          enquiries.map((enq) =>
            enq.id === currentEnquiry.id
              ? { ...enq, status: "replied", admin_reply: true }
              : enq
          )
        );
      } else {
        console.error("Error sending reply:", result.error);
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        const result = await deleteEnquiry(id);
        if (result.success) {
          setEnquiries(enquiries.filter((enquiry) => enquiry.id !== id));
        } else {
          console.error("Error deleting enquiry:", result.error);
        }
      } catch (err) {
        console.error("Error deleting enquiry:", err);
      }
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const result = await updateEnquiryStatus(enquiryId, newStatus);
      if (result.success) {
        setEnquiries(
          enquiries.map((enq) =>
            enq.id === enquiryId ? { ...enq, status: newStatus } : enq
          )
        );
      } else {
        console.error("Error updating status:", result.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle user details
  const handleUserClick = async (userId) => {
    if (!userId) return;
    
    setLoadingUserDetails(true);
    setUserDetailsModalOpen(true);
    
    try {
      const result = await getAllUsersWithDetailedAddress();
      if (result.success) {
        const user = result.users.find(u => u.id === userId);
        if (user) {
          setSelectedUserDetails(user);
        } else {
          setSelectedUserDetails(null);
        }
      } else {
        console.error("Error fetching user details:", result.error);
        setSelectedUserDetails(null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setSelectedUserDetails(null);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Card shadow="sm" p="lg" radius="md" className="mantine-card mb-6">
        <Group position="apart" className="mb-4">
          <Title order={2}>Customer Enquiries</Title>
          <Button onClick={loadEnquiries} variant="light" size="sm">
            Refresh
          </Button>
        </Group>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <TextInput
            className="flex-1"
            placeholder="Search by name, email or message..."
            icon={<FaSearch />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            className="w-full md:w-48"
            placeholder="Filter by Status"
            clearable
            data={[
              { value: "pending", label: "Pending" },
              { value: "replied", label: "Replied" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table striped highlightOnHover withTableBorder style={{ tableLayout: 'fixed', minWidth: '1200px' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '250px' }}>Customer</Table.Th>
                    <Table.Th style={{ width: '150px' }}>Total</Table.Th>
                    <Table.Th style={{ width: '140px' }}>Date</Table.Th>
                    <Table.Th style={{ width: '120px' }}>Status</Table.Th>
                    <Table.Th style={{ width: '340px', textAlign: 'center' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedEnquiries.map((enquiry) => (
                    <Table.Tr key={enquiry.id}>
                      <Table.Td style={{ width: '250px' }}>
                        <Group spacing="sm">
                          <Tooltip label="View user details">
                            <Avatar 
                              src={enquiry.avatar || `https://i.pravatar.cc/150?u=${enquiry.email}`} 
                              size="md" 
                              radius="xl"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleUserClick(enquiry.user_id)}
                            />
                          </Tooltip>
                          <div style={{ overflow: 'hidden' }}>
                            <div className="flex items-center gap-2">
                              <Text 
                                size="sm" 
                                weight={500}
                                style={{ 
                                  whiteSpace: 'nowrap', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  maxWidth: '140px'
                                }}
                              >
                                {enquiry.name}
                              </Text>
                              {enquiry.type === "custom_printing" && (
                                <Badge size="xs" color="purple" variant="light">
                                  Custom Print
                                </Badge>
                              )}
                            </div>
                            <Text size="xs" color="dimmed" style={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              maxWidth: '180px'
                            }}>
                              {enquiry.email}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ width: '150px' }}>
                        <Text size="sm" weight={500}>
                          {enquiry.type === "custom_printing" ? (
                            <span style={{ color: "#9c27b0" }}>
                              Custom Print
                            </span>
                          ) : (
                            `₹${calculateTotal(enquiry.enquiry_items).toFixed(
                              2
                            )}`
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ width: '140px' }}>
                        <Text size="xs" style={{ 
                          whiteSpace: 'nowrap' 
                        }}>
                          {formatDateIST(enquiry.created_at)}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ width: '120px' }}>
                        <Badge
                          color={
                            enquiry.status === "pending"
                              ? "orange"
                              : enquiry.status === "replied"
                              ? "blue"
                              : enquiry.status === "resolved"
                              ? "green"
                              : "gray"
                          }
                          variant="light"
                          size="sm"
                        >
                          {enquiry.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ width: '340px' }}>
                        <Group spacing={12} justify="center">
                          <Tooltip label="View Details">
                            <Button
                              variant="filled"
                              color="blue"
                              onClick={() => openViewModal(enquiry)}
                              size="xs"
                              leftIcon={<FaEye size={16} />}
                            >
                              View
                            </Button>
                          </Tooltip>
                          <Tooltip label="Open Chat">
                            <Button
                              variant="filled"
                              color="green"
                              onClick={() => openChatModal(enquiry)}
                              size="xs"
                              leftIcon={<FaComments size={16} />}
                            >
                              Chat
                            </Button>
                          </Tooltip>
                          <Tooltip label="Delete Enquiry">
                            <Button
                              variant="filled"
                              color="red"
                              onClick={() => handleDeleteEnquiry(enquiry.id)}
                              size="xs"
                              leftIcon={<FaTrash size={16} />}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={totalPages}
                  value={activePage}
                  onChange={setActivePage}
                  size="sm"
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* View Modal */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Enquiry Details"
        size="lg"
      >
        {currentEnquiry && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Text>
                <strong>Name:</strong> {currentEnquiry.name}
              </Text>
              {currentEnquiry.type === "custom_printing" && (
                <Badge color="purple" variant="light">
                  Custom Printing Request
                </Badge>
              )}
            </div>
            <Text>
              <strong>Email:</strong> {currentEnquiry.email}
            </Text>
            <Text>
              <strong>Message:</strong> {currentEnquiry.message}
            </Text>
            <Text>
              <strong>Date:</strong> {formatDateIST(currentEnquiry.created_at)}
            </Text>

            {currentEnquiry.enquiry_items?.length > 0 && (
              <div>
                <Text weight={500}>
                  Items (Total: ₹
                  {calculateTotal(currentEnquiry.enquiry_items).toFixed(2)})
                </Text>
                {currentEnquiry.enquiry_items.map((item, index) => (
                  <Text key={index} size="sm">
                    {item.product_name} x{item.quantity} - ₹{item.price}
                  </Text>
                ))}
              </div>
            )}

            <Group position="right">
              <Button variant="subtle" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              <Button
                color="green"
                onClick={() => {
                  setViewModalOpen(false);
                  openChatModal(currentEnquiry);
                }}
              >
                Chat
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Chat Modal */}
      <Modal
        opened={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        title="Enquiry Chat"
        size="xl"
      >
        {currentEnquiry && (
          <div className="space-y-4">
            <Paper p="md" withBorder>
              <Group>
                <Avatar color="blue" radius="xl">
                  <FaUser />
                </Avatar>
                <div>
                  <Text weight={500}>{currentEnquiry.name}</Text>
                  <Text size="sm" color="dimmed">
                    {currentEnquiry.email}
                  </Text>
                  {currentEnquiry.type === "custom_printing" && (
                    <Badge size="sm" color="purple" variant="light">
                      Custom Print Request
                    </Badge>
                  )}
                </div>
                <Badge color="blue" variant="light" className="ml-auto">
                  {currentEnquiry.status}
                </Badge>
              </Group>
            </Paper>

            {/* Custom Print Details */}
            {currentEnquiry.type === "custom_printing" &&
              currentEnquiry.enquiry_items?.length > 0 && (
                <Paper p="md" withBorder style={{ backgroundColor: "#f8f9fa" }}>
                  <Text weight={500} mb="sm">
                    Print Request Details:
                  </Text>
                  {currentEnquiry.enquiry_items.map((item, index) => (
                    <div key={index} className="mb-2">
                      <Text size="sm" weight={500}>
                        {item.product_name}
                      </Text>
                      {item.customization && (
                        <Text size="xs" color="dimmed">
                          {item.customization}
                        </Text>
                      )}
                      <Text size="sm">
                        Quantity: {item.quantity} |
                        {item.price > 0
                          ? ` Estimated: ₹${item.price}`
                          : " Price: Pending Quote"}
                      </Text>
                    </div>
                  ))}
                  <Text size="xs" color="dimmed" mt="sm">
                    Use the print requests section to update pricing and status.
                    <a
                      href="/print-requests"
                      style={{ color: "#1976d2", textDecoration: "underline" }}
                    >
                      Go to Print Requests
                    </a>
                  </Text>
                </Paper>
              )}

            <ScrollArea h={400}>
              <div className="space-y-4">
                <div className="flex justify-start">
                  <Paper p="md" radius="lg" className="bg-gray-100 max-w-lg">
                    <Text size="sm" color="dimmed" mb="xs">
                      {formatDateIST(currentEnquiry.created_at)} - Customer
                    </Text>
                    <Text size="sm">{currentEnquiry.message}</Text>
                  </Paper>
                </div>

                {enquiryReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className={
                      reply.is_admin ? "flex justify-end" : "flex justify-start"
                    }
                  >
                    <Paper
                      p="md"
                      radius="lg"
                      className={
                        reply.is_admin
                          ? "bg-green-100 max-w-lg"
                          : "bg-gray-100 max-w-lg"
                      }
                    >
                      <Text size="sm" color="dimmed" mb="xs">
                        {formatDateIST(reply.created_at)} -{" "}
                        {reply.is_admin ? "Admin" : "Customer"}
                      </Text>
                      <Text size="sm">{reply.message}</Text>
                    </Paper>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Divider />

            <div className="space-y-3">
              <Text weight={500}>Send Reply</Text>
              <Textarea
                placeholder="Type your reply here..."
                minRows={2}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <Group position="apart">
                <Select
                  placeholder="Update Status"
                  data={[
                    { value: "pending", label: "Pending" },
                    { value: "replied", label: "Replied" },
                    { value: "resolved", label: "Resolved" },
                    { value: "closed", label: "Closed" },
                  ]}
                  value={currentEnquiry.status}
                  onChange={(value) =>
                    handleStatusChange(currentEnquiry.id, value)
                  }
                  style={{ minWidth: "150px" }}
                />
                <Group>
                  <Button
                    variant="subtle"
                    onClick={() => setChatModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    color="green"
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || sendingReply}
                    loading={sendingReply}
                    leftIcon={<FaPaperPlane />}
                  >
                    Send Reply
                  </Button>
                </Group>
              </Group>
            </div>
          </div>
        )}
      </Modal>

      {/* User Details Modal */}
      <Modal
        opened={userDetailsModalOpen}
        onClose={() => setUserDetailsModalOpen(false)}
        title="User Details"
        size="md"
      >
        {loadingUserDetails ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader size="lg" />
            <Text mt="md">Loading user details...</Text>
          </div>
        ) : selectedUserDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header with avatar and basic info */}
            <Paper p="lg" radius="md" withBorder>
              <Group spacing="md">
                <Avatar 
                  src={selectedUserDetails.avatar} 
                  size="xl" 
                  radius="xl"
                  color="blue"
                >
                  <FaUserCircle size={40} />
                </Avatar>
                <div>
                  <Text size="xl" weight={600}>{selectedUserDetails.name}</Text>
                  <Text size="sm" color="dimmed">{selectedUserDetails.role === 'admin' ? 'Administrator' : 'Customer'}</Text>
                  <Text size="sm" color={selectedUserDetails.active ? 'green' : 'red'}>
                    {selectedUserDetails.active ? 'Active' : 'Inactive'}
                  </Text>
                </div>
              </Group>
            </Paper>

            {/* Contact Information */}
            <div>
              <Text weight={500} mb="sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaEnvelope /> Contact Information
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Text size="xs" color="dimmed">Email</Text>
                  <Text size="sm">{selectedUserDetails.email}</Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed">Phone</Text>
                  <Text size="sm">{selectedUserDetails.phone || 'Not provided'}</Text>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {selectedUserDetails.fullAddress && (
              <div>
                <Text weight={500} mb="sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaMapMarkerAlt /> Address
                </Text>
                <Paper p="md" radius="md" withBorder>
                  <Text size="sm">{selectedUserDetails.fullAddress}</Text>
                </Paper>
              </div>
            )}

            {/* Account Details */}
            <div>
              <Text weight={500} mb="sm">Account Details</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Text size="xs" color="dimmed">Account Type</Text>
                  <Text size="sm">{selectedUserDetails.account_type || 'Standard'}</Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed">Joined Date</Text>
                  <Text size="sm">{selectedUserDetails.joined || 'N/A'}</Text>
                </div>
              </div>
              {selectedUserDetails.company_name && (
                <div style={{ marginTop: '12px' }}>
                  <Text size="xs" color="dimmed">Company</Text>
                  <Text size="sm">{selectedUserDetails.company_name}</Text>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button
                variant="outline"
                onClick={() => navigate(`/users?userId=${selectedUserDetails.id}`)}
              >
                Go to User Management
              </Button>
              <Button
                onClick={() => setUserDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text color="red">User details not found</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnquiryPage;
