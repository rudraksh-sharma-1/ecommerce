import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Table,
  Badge,
  Group,
  Button,
  Text,
  Paper,
  Modal,
  Select,
  Textarea,
  Image,
  Card,
  Loader,
  Alert,
  Stack,
  NumberInput,
  ScrollArea,
  Avatar,
  Divider,
  Tooltip,
} from "@mantine/core";
import { FaUser, FaPaperPlane, FaTrash, FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import {
  getEnquiryWithReplies,
  addEnquiryReply,
  updateEnquiryStatus,
  deletePrintRequest,
  getAllUsersWithDetailedAddress,
} from "../../utils/supabaseApi";

const statusColors = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};

import supabase from "../../utils/supabase";
import { formatDateIST } from "../../utils/dateUtils";

// Helper function to construct full address from enhanced address fields
const constructFullAddress = (user) => {
  if (!user) return "N/A";
  
  const addressParts = [
    user.house_number,
    user.street_address,
    user.suite_unit_floor,
    user.locality,
    user.area,
    user.city,
    user.state,
    user.postal_code,
    user.country,
    user.landmark
  ].filter(part => part && part.trim() !== "");
  
  return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
};

export default function PrintRequests() {
  const [printRequests, setPrintRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState(""); // adminNote maps to DB column admin_note
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [priceNotes, setPriceNotes] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [currentEnquiry, setCurrentEnquiry] = useState(null);
  const [enquiryReplies, setEnquiryReplies] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function getPrintRequests() {
      setLoading(true);
      setError("");
      // Fetch print_requests joined with users with enhanced address structure
      const { data: printRequests, error } = await supabase
        .from("print_requests")
        .select(`
          *, 
          users:user_id (
            id, email, name, avatar, phone,
            house_number, street_address, suite_unit_floor,
            locality, area, city, state, postal_code, country, landmark
          )
        `)
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
      } else if (printRequests && printRequests.length > 0) {
        setPrintRequests(printRequests);
      }
      setLoading(false);
    }
    getPrintRequests();
  }, []);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setAdminNote(request.admin_note || "");
    setEstimatedPrice(request.estimated_price || 0);
    setFinalPrice(request.final_price || 0);
    setPriceNotes(request.price_notes || "");
    setStatusUpdateError("");
    setStatusUpdateSuccess(false);
    setStatusUpdateModalOpen(true);
  };

  const submitStatusUpdate = async () => {
    if (!newStatus) {
      setStatusUpdateError("Please select a status");
      return;
    }
    setStatusUpdateLoading(true);
    setStatusUpdateError("");
    setStatusUpdateSuccess(false);
    try {
      const { error } = await supabase
        .from("print_requests")
        .update({
          status: newStatus,
          admin_note: adminNote,
          estimated_price: estimatedPrice,
          final_price: finalPrice,
          price_notes: priceNotes,
        })
        .eq("id", selectedRequest.id);

      if (!error) {
        // Also update the enquiry item price if this is linked to an enquiry
        if (
          selectedRequest.enquiry_id &&
          (estimatedPrice > 0 || finalPrice > 0)
        ) {
          const priceToUpdate = finalPrice > 0 ? finalPrice : estimatedPrice;
          await supabase
            .from("enquiry_items")
            .update({ price: priceToUpdate })
            .eq("enquiry_id", selectedRequest.enquiry_id);
        }

        setStatusUpdateSuccess(true);
        setPrintRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === selectedRequest.id
              ? {
                  ...req,
                  status: newStatus,
                  admin_note: adminNote,
                  estimated_price: estimatedPrice,
                  final_price: finalPrice,
                  price_notes: priceNotes,
                }
              : req
          )
        );
        setTimeout(() => {
          setStatusUpdateModalOpen(false);
        }, 1500);
      } else {
        setStatusUpdateError(error.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      setStatusUpdateError("An unexpected error occurred. Please try again.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const openChatModal = async (enquiryId) => {
    const result = await getEnquiryWithReplies(enquiryId);
    if (result.success) {
      setCurrentEnquiry(result.enquiry);
      setEnquiryReplies(result.enquiry.enquiry_replies || []);
      setChatModalOpen(true);
    } else {
      alert("Failed to load chat: " + result.error);
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
      } else {
        alert("Failed to send reply: " + result.error);
      }
    } catch (err) {
      alert("Failed to send reply: " + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteRequest = (request) => {
    setRequestToDelete(request);
    setDeleteModalOpen(true);
  };

  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    setDeleteLoading(true);
    try {
      const result = await deletePrintRequest(requestToDelete.id);
      if (result.success) {
        setPrintRequests(prev => prev.filter(req => req.id !== requestToDelete.id));
        setDeleteModalOpen(false);
        setRequestToDelete(null);
      } else {
        alert("Failed to delete print request: " + result.error);
      }
    } catch (error) {
      alert("Failed to delete print request: " + error.message);
    } finally {
      setDeleteLoading(false);
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

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl" withBorder>
          <Group position="center">
            <Loader size="xl" />
            <Text>Loading printing requests...</Text>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Title mb="lg">Print Requests</Title>

      {error && (
        <Alert color="red" mb="lg" title="Error">
          {error}
        </Alert>
      )}

      {printRequests.length === 0 ? (
        <Paper p="xl" withBorder>
          <Text align="center">No printing requests found.</Text>
        </Paper>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <Paper p="xs" withBorder>
            <Table striped highlightOnHover withTableBorder style={{ tableLayout: 'fixed', minWidth: '1300px' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '250px' }}>Customer</Table.Th>
                  <Table.Th style={{ width: '180px' }}>Product</Table.Th>
                  <Table.Th style={{ width: '200px' }}>Details</Table.Th>
                  <Table.Th style={{ width: '150px' }}>Price</Table.Th>
                  <Table.Th style={{ width: '140px' }}>Date</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Status</Table.Th>
                  <Table.Th style={{ width: '260px' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {printRequests.map((request) => (
                  <Table.Tr key={request.id}>
                    <Table.Td style={{ width: '250px' }}>
                      <Group spacing="sm">
                        <Tooltip label="View user details">
                          <Avatar 
                            src={request.users?.avatar || `https://i.pravatar.cc/150?u=${request.users?.email}`} 
                            size="md" 
                            radius="xl"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleUserClick(request.users?.id)}
                          />
                        </Tooltip>
                        <div style={{ overflow: 'hidden' }}>
                          <Text 
                            weight={500} 
                            size="sm"
                            style={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              maxWidth: '140px'
                            }}
                          >
                            {request.users?.name ||
                              request.users?.email ||
                              "Unknown"}
                          </Text>
                        <Text size="xs" color="dimmed" style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          maxWidth: '180px'
                        }}>
                          {request.users?.email || "N/A"}
                        </Text>
                        <Text size="xs" color="dimmed" style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          maxWidth: '180px'
                        }}>
                          Phone: {request.users?.phone || "N/A"}
                        </Text>
                        <Text size="xs" color="dimmed" title={constructFullAddress(request.users)} style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          maxWidth: '180px'
                        }}>
                          Address: {constructFullAddress(request.users).length > 20 
                            ? `${constructFullAddress(request.users).substring(0, 20)}...` 
                            : constructFullAddress(request.users)
                          }
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ width: '180px', verticalAlign: 'top', padding: '12px 8px' }}>
                    <Text size="sm" style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {request.product_type || "Custom Product"}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ width: '200px', verticalAlign: 'top', padding: '12px 8px' }}>
                    <Stack spacing={2}>
                      <Text size="sm">Size: {request.size || "N/A"}</Text>
                      <Text size="sm">Color: {request.color || "N/A"}</Text>
                      <Text size="sm">Qty: {request.quantity || 1}</Text>
                      <Text size="sm">
                        Position: {request.position || "N/A"}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td style={{ width: '150px', verticalAlign: 'top', padding: '12px 8px' }}>
                    <Stack spacing={2}>
                      {request.estimated_price > 0 && (
                        <Text size="sm" weight={500} color="green">
                          Est: ₹{request.estimated_price}
                        </Text>
                      )}
                      {request.final_price > 0 && (
                        <Text size="sm" weight={600} color="blue">
                          Final: ₹{request.final_price}
                        </Text>
                      )}
                      {!request.estimated_price && !request.final_price && (
                        <Text size="xs" color="dimmed">
                          No price set
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td style={{ width: '140px', verticalAlign: 'top', padding: '12px 8px' }}>
                    <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateIST(request.created_at)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ width: '120px', verticalAlign: 'top', padding: '12px 8px' }}>
                    <Badge color={statusColors[request.status] || "gray"}>
                      {request.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ width: '260px', verticalAlign: 'top', padding: '12px 8px' }}>
                    <Group spacing="xs" justify="center">
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => handleViewRequest(request)}
                      >
                        View
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => handleUpdateStatus(request)}
                      >
                        Update
                      </Button>
                      {request.enquiry_id && (
                        <Button
                          size="xs"
                          color="green"
                          onClick={() => openChatModal(request.enquiry_id)}
                        >
                          Chat
                        </Button>
                      )}
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteRequest(request)}
                        leftIcon={<FaTrash size={12} />}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          </Paper>
        </div>
      )}

      {/* View Request Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Print Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div>
            <Card withBorder mb="md">
              <Group position="apart" mb="md">
                <Text weight={500}>Request ID:</Text>
                <Text>{selectedRequest.id}</Text>
              </Group>

              <Group position="apart" mb="md">
                <Text weight={500}>Customer:</Text>
                <Group spacing="xs">
                  {selectedRequest.users?.avatar && (
                    <img
                      src={selectedRequest.users.avatar}
                      alt="avatar"
                      style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                  )}
                  <div>
                    <Text weight={500} size="sm">
                      {selectedRequest.users?.name ||
                        selectedRequest.users?.email ||
                        "Unknown"}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {selectedRequest.users?.email || "N/A"}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Phone: {selectedRequest.users?.phone || "N/A"}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Address: {constructFullAddress(selectedRequest.users)}
                    </Text>
                  </div>
                </Group>
              </Group>

              <Group position="apart" mb="md">
                <Text weight={500}>Product:</Text>
                <Text>{selectedRequest.product_type || "Custom Product"}</Text>
              </Group>

              <Group position="apart" mb="md">
                <Text weight={500}>Estimated Price:</Text>
                <Text size="lg" weight={600} color="green">
                  ₹{selectedRequest.estimated_price || 0}
                </Text>
              </Group>

              {selectedRequest.final_price > 0 && (
                <Group position="apart" mb="md">
                  <Text weight={500}>Final Price:</Text>
                  <Text size="lg" weight={600} color="blue">
                    ₹{selectedRequest.final_price}
                  </Text>
                </Group>
              )}

              {selectedRequest.price_notes && (
                <>
                  <Text weight={500} mb="xs">
                    Price Notes:
                  </Text>
                  <Card mb="md" p="xs" withBorder>
                    <Text>{selectedRequest.price_notes}</Text>
                  </Card>
                </>
              )}

              <Group position="apart" mb="md">
                <Text weight={500}>Status:</Text>
                <Badge color={statusColors[selectedRequest.status] || "gray"}>
                  {selectedRequest.status}
                </Badge>
              </Group>

              <Group position="apart" mb="md">
                <Text weight={500}>Date Submitted:</Text>
                <Text>{formatDateIST(selectedRequest.created_at)}</Text>
              </Group>

              <Text weight={500} mb="xs">
                Options:
              </Text>
              <Card mb="md" p="xs" withBorder>
                <Text>Size: {selectedRequest.size || "N/A"}</Text>
                <Text>Color: {selectedRequest.color || "N/A"}</Text>
                <Text>Quantity: {selectedRequest.quantity || 1}</Text>
                <Text>Position: {selectedRequest.position || "N/A"}</Text>
              </Card>

              {selectedRequest.admin_note && (
                <>
                  <Text weight={500} mb="xs">
                    Admin Notes:
                  </Text>
                  <Card mb="md" p="xs" withBorder>
                    <Text>{selectedRequest.admin_note}</Text>
                  </Card>
                </>
              )}

              <Text weight={500} mb="xs">
                Customer Design:
              </Text>
              {selectedRequest.image_url ? (
                <Group spacing="xs">
                  <a
                    href={selectedRequest.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={selectedRequest.image_url}
                      alt="Customer Design"
                      height={200}
                      fit="contain"
                      withPlaceholder
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                  <Button
                    component="a"
                    href={selectedRequest.image_url}
                    download
                    color="blue"
                    variant="outline"
                    size="xs"
                    target="_blank"
                  >
                    Download
                  </Button>
                </Group>
              ) : (
                <Text color="dimmed">No image available</Text>
              )}
            </Card>

            <Group position="right">
              <Button
                onClick={() => handleUpdateStatus(selectedRequest)}
                color="blue"
              >
                Update Status
              </Button>
              <Button onClick={() => setModalOpen(false)} variant="subtle">
                Close
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        opened={statusUpdateModalOpen}
        onClose={() => setStatusUpdateModalOpen(false)}
        title="Update Request Status"
      >
        {selectedRequest && (
          <div>
            <Select
              label="Status"
              placeholder="Select new status"
              value={newStatus}
              onChange={(value) => setNewStatus(value)}
              data={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
              mb="md"
              required
              withinPortal
            />

            <Textarea
              label="Admin Notes"
              placeholder="Add notes for this request (optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.currentTarget.value)}
              minRows={3}
              mb="md"
            />

            <NumberInput
              label="Estimated Price (₹)"
              placeholder="Enter estimated price"
              value={estimatedPrice}
              onChange={(value) => setEstimatedPrice(value || 0)}
              min={0}
              precision={2}
              mb="md"
            />

            <NumberInput
              label="Final Price (₹)"
              placeholder="Enter final quoted price"
              value={finalPrice}
              onChange={(value) => setFinalPrice(value || 0)}
              min={0}
              precision={2}
              mb="md"
            />

            <Textarea
              label="Price Notes"
              placeholder="Add notes about pricing (optional)"
              value={priceNotes}
              onChange={(e) => setPriceNotes(e.currentTarget.value)}
              minRows={2}
              mb="md"
            />

            {statusUpdateError && (
              <Alert color="red" mb="md" title="Error">
                {statusUpdateError}
              </Alert>
            )}

            {statusUpdateSuccess && (
              <Alert color="green" mb="md" title="Success">
                Request status updated successfully!
              </Alert>
            )}

            <Group position="right">
              <Button
                onClick={() => setStatusUpdateModalOpen(false)}
                variant="subtle"
                disabled={statusUpdateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={submitStatusUpdate}
                loading={statusUpdateLoading}
                color="blue"
              >
                Update Status
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
            {currentEnquiry.type === "custom_printing" &&
              currentEnquiry.enquiry_items?.length > 0 && (
                <Paper p="md" withBorder>
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
                </Paper>
              )}
            <ScrollArea h={400}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper p="md" radius="lg" withBorder style={{ maxWidth: '400px' }}>
                    <Text size="sm" color="dimmed" mb="xs">
                      {formatDateIST(currentEnquiry.created_at)} - Customer
                    </Text>
                    <Text size="sm">{currentEnquiry.message}</Text>
                  </Paper>
                </div>
                {enquiryReplies.map((reply) => (
                  <div
                    key={reply.id}
                    style={{
                      display: 'flex',
                      justifyContent: reply.is_admin ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Paper
                      p="md"
                      radius="lg"
                      withBorder
                      style={{ 
                        maxWidth: '400px',
                        backgroundColor: reply.is_admin ? 'var(--mantine-color-green-light)' : undefined
                      }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Text weight={500}>Send Reply</Text>
              <Textarea
                placeholder="Type your reply here..."
                minRows={3}
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
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete this print request? This action cannot be undone and will also delete all associated replies.
        </Text>
        {requestToDelete && (
          <Text size="sm" color="dimmed" mb="lg">
            Request ID: {requestToDelete.id} - {requestToDelete.product_name}
          </Text>
        )}
        <Group position="right">
          <Button
            variant="subtle"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={confirmDeleteRequest}
            loading={deleteLoading}
            leftIcon={<FaTrash />}
          >
            Delete
          </Button>
        </Group>
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
    </Container>
  );
}
