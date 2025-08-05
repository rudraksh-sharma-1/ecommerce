import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Group,
  Badge,
  ActionIcon,
  Button,
  TextInput,
  Select,
  Menu,
  Modal,
  Textarea,
  LoadingOverlay,
  Alert,
  Pagination,
  Avatar,
  Tooltip,
} from "@mantine/core";
import {
  FaSearch,
  FaEdit,
  FaEye,
  FaCheck,
  FaTimes,
  FaBoxOpen,
  FaTruck,
  FaMoneyBillWave,
  FaShippingFast,
  FaUserAlt,
  FaBox,
  FaCartPlus,
  FaFilter,
} from "react-icons/fa";
import { getAllOrders, updateOrderStatus } from '../../utils/supabaseApi'
import supabase from '../../utils/supabase';
import { formatDateIST } from '../../utils/dateUtils';

const orderStatusColors = {
  pending: "yellow",
  processing: "blue",
  shipped: "indigo",
  delivered: "green",
  cancelled: "red",
  refunded: "gray",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [orderDetailModal, setOrderDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  
  const itemsPerPage = 10;

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getAllOrders();
      if (result.success) {
        setOrders(result.orders);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) {
      return;
    }

    try {
      setLoading(true);
      const result = await updateOrderStatus(selectedOrder.id, newStatus, adminNotes);
      
      if (result.success) {
        // Update order in local state
        setOrders(orders.map(order => {
          if (order.id === selectedOrder.id) {
            return { ...order, status: newStatus, adminNotes };
          }
          return order;
        }));
        
        setStatusModalOpen(false);
        setNewStatus("");
        setAdminNotes("");
        setSelectedOrder(null);
      } else {
        setError("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // View order details and fetch customer data
  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    setOrderDetailModal(true);
    
    if (order.userId) {
      try {
        setFetchingCustomer(true);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', order.userId)
          .single();
        if (!userError && userData) {
          setCustomerData(userData);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setFetchingCustomer(false);
      }
    }
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === "" ||
      (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "" || order.status === statusFilter;
    
    const matchesDate = dateFilter === "" || 
      (order.date && (
        dateFilter === "today" ? 
          new Date(order.date).toDateString() === new Date().toDateString() : 
        dateFilter === "week" ? 
          new Date(order.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : 
        dateFilter === "month" ? 
          new Date(order.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : 
          true
      ));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Paginate filtered orders
  const paginatedOrders = filteredOrders.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      
      {error && (
        <Alert color="red" title="Error" onClose={() => setError(null)} mb="md">
          {error}
        </Alert>
      )}
      
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group position="apart">
            <Title order={3}>Orders Management</Title>
            <Button 
              variant="subtle"
              onClick={fetchOrders}
            >
              Refresh Orders
            </Button>
          </Group>
        </Card.Section>

        <Group mt="md" mb="md">
          <TextInput
            placeholder="Search by order ID or customer..."
            icon={<FaSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          
          <Select
            placeholder="Order Status"
            clearable
            data={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
              { value: "refunded", label: "Refunded" }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          />
          
          <Select
            placeholder="Date"
            clearable
            data={[
              { value: "", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" }
            ]}
            value={dateFilter}
            onChange={setDateFilter}
            style={{ width: 150 }}
          />
        </Group>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Text weight={500} size="sm">
                      #{order.id.substring(0, 8)}
                    </Text>
                  </td>
                  <td>
                    <Group spacing="sm">
                      <Avatar 
                        size={30} 
                        radius="xl" 
                        src={order.customerAvatar || null}
                        color="blue"
                      >
                        <FaUserAlt size={16} />
                      </Avatar>
                      <div>
                        <Text size="sm" weight={500}>
                          {order.customerName || "Anonymous"}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {order.customerEmail || "No email"}
                        </Text>
                      </div>
                    </Group>
                  </td>
                  <td>
                    <Text size="sm">{formatDateIST(order.date)}</Text>
                  </td>
                  <td>
                    <Text weight={500} size="sm">
                      ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                    </Text>
                  </td>
                  <td>
                    <Badge 
                      color={orderStatusColors[order.status] || "gray"}
                      variant="filled"
                      size="sm"
                    >
                      {order.status || "Unknown"}
                    </Badge>
                  </td>
                  <td>
                    <Group spacing={8}>
                      <Tooltip label="View Details">
                        <ActionIcon 
                          color="blue" 
                          variant="light"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FaEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Update Status">
                        <ActionIcon 
                          color="green" 
                          variant="light"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status || "");
                            setAdminNotes(order.adminNotes || "");
                            setStatusModalOpen(true);
                          }}
                        >
                          <FaEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text color="dimmed">No orders found</Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <Group position="center" mt="xl">
            <Pagination
              total={totalPages}
              page={activePage}
              onChange={setActivePage}
            />
          </Group>
        )}
      </Card>

      {/* Order Status Update Modal */}
      <Modal
        opened={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Order Status"
        size="md"
      >
        <div style={{ padding: "10px 0" }}>
          <Select
            label="New Status"
            placeholder="Select new status"
            data={[
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
              { value: "refunded", label: "Refunded" }
            ]}
            value={newStatus}
            onChange={setNewStatus}
            required
            mb="md"
          />
          
          <Textarea
            label="Admin Notes"
            placeholder="Add notes about this status change"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.currentTarget.value)}
            minRows={3}
            mb="md"
          />
          
          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        opened={orderDetailModal}
        onClose={() => {
          setOrderDetailModal(false);
          setSelectedOrder(null);
          setCustomerData(null);
        }}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div>
            <Group position="apart" mb="md">
              <div>
                <Text weight={700} size="lg">Order #{selectedOrder.id.substring(0, 8)}</Text>
                <Text size="sm" color="dimmed">Placed on {formatDateIST(selectedOrder.date)}</Text>
              </div>
              <Badge 
                color={orderStatusColors[selectedOrder.status] || "gray"}
                variant="filled"
                size="lg"
              >
                {selectedOrder.status || "Unknown"}
              </Badge>
            </Group>

            <Card withBorder mb="md">
              <Title order={5} mb="xs">Customer Information</Title>
              {fetchingCustomer ? (
                <Text size="sm">Loading customer data...</Text>
              ) : customerData ? (
                <div>
                  <Group>
                    <Avatar 
                      size={40} 
                      radius="xl" 
                      src={customerData.avatar || null}
                      color="blue"
                    >
                      <FaUserAlt size={20} />
                    </Avatar>
                    <div>
                      <Text weight={500}>{customerData.name || "N/A"}</Text>
                      <Text size="sm">{customerData.email || "N/A"}</Text>
                      <Text size="sm">Phone: {customerData.phone || "N/A"}</Text>
                    </div>
                  </Group>
                </div>
              ) : (
                <Text size="sm">Customer information not available</Text>
              )}
            </Card>

            <Card withBorder mb="md">
              <Title order={5} mb="xs">Order Items</Title>
              <Table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Group spacing="sm">
                            <Avatar 
                              size={30} 
                              radius="md" 
                              src={item.imageUrl || null}
                              color="gray"
                            >
                              <FaBox size={16} />
                            </Avatar>
                            <Text size="sm">{item.name || "Unknown Product"}</Text>
                          </Group>
                        </td>
                        <td>₹{parseFloat(item.price || 0).toFixed(2)}</td>
                        <td>{item.quantity || 1}</td>
                        <td>₹{parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        <Text color="dimmed">No items found</Text>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right" }}>
                      <Text weight={500}>Subtotal:</Text>
                    </td>
                    <td>
                      <Text weight={500}>
                        ₹{parseFloat(selectedOrder.subtotal || selectedOrder.totalAmount || 0).toFixed(2)}
                      </Text>
                    </td>
                  </tr>
                  {selectedOrder.shipping && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right" }}>
                        <Text>Shipping:</Text>
                      </td>
                      <td>
                        <Text>₹{parseFloat(selectedOrder.shipping || 0).toFixed(2)}</Text>
                      </td>
                    </tr>
                  )}
                  {selectedOrder.tax && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right" }}>
                        <Text>Tax:</Text>
                      </td>
                      <td>
                        <Text>₹{parseFloat(selectedOrder.tax || 0).toFixed(2)}</Text>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right" }}>
                      <Text weight={700}>Total:</Text>
                    </td>
                    <td>
                      <Text weight={700} size="lg">
                        ₹{parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}
                      </Text>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Card>

            {selectedOrder.shippingAddress && (
              <Card withBorder mb="md">
                <Title order={5} mb="xs">Shipping Information</Title>
                <Text>
                  {selectedOrder.shippingAddress.name || "N/A"}<br />
                  {selectedOrder.shippingAddress.street || "N/A"}<br />
                  {selectedOrder.shippingAddress.city || "N/A"}, {selectedOrder.shippingAddress.state || "N/A"} {selectedOrder.shippingAddress.zip || "N/A"}<br />
                  {selectedOrder.shippingAddress.country || "N/A"}
                </Text>
              </Card>
            )}

            {selectedOrder.adminNotes && (
              <Card withBorder mb="md">
                <Title order={5} mb="xs">Admin Notes</Title>
                <Text>{selectedOrder.adminNotes}</Text>
              </Card>
            )}

            <Group position="right" mt="xl">
              <Button 
                variant="light" 
                color="blue"
                onClick={() => {
                  setOrderDetailModal(false);
                  setNewStatus(selectedOrder.status || "");
                  setAdminNotes(selectedOrder.adminNotes || "");
                  setStatusModalOpen(true);
                }}
              >
                Update Status
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
