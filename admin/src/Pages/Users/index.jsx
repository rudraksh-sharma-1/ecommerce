import React, { useState, useEffect } from "react";
import { 
  Card, 
  Title, 
  Table, 
  ActionIcon, 
  Group, 
  Button, 
  TextInput, 
  Badge,
  Modal,
  Avatar, 
  Text,
  Switch,
  Pagination,
  Select,
  PasswordInput,
  LoadingOverlay,
  Notification,
  Tooltip,
  Tabs
} from "@mantine/core";
import { 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaUserAlt,
  FaKey,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt
} from "react-icons/fa";

import { 
  getAllUsersWithDetailedAddress, 
  addUserWithDetailedAddress, 
  updateUserWithDetailedAddress, 
  deleteUser, 
  toggleUserStatus 
} from '../../utils/supabaseApi';
import supabase from '../../utils/supabase';
import { formatDateOnlyIST } from '../../utils/dateUtils';
import UserAddressManager from '../../Components/UserAddressManager';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    role: "customer", 
    active: true,
    avatar: "",
    account_type: "",
    company_name: "",
    // Detailed address fields
    house_number: "",
    street_address: "",
    suite_unit_floor: "",
    locality: "",
    area: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    landmark: ""
  });
  const [newUserPassword, setNewUserPassword] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // Added for tab navigation
  const itemsPerPage = 10;

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsersWithDetailedAddress();
      
      if (result.success) {
        setUsers(result.users || []);
        setError(null);
      } else {
        console.error("Error fetching users:", result.error);
        setError("Failed to load users: " + result.error);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setError("An unexpected error occurred while loading users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, isSuccess = true) => {
    setNotification({
      message,
      type: isSuccess ? 'success' : 'error'
    });
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle create new user
  const handleCreateUser = async () => {
    // Validation for required fields
    const errors = {};
    if (!newUser.name || newUser.name.trim().length < 2) {
      errors.name = 'Name is required (min 2 characters)';
    }
    if (!newUser.email || !/^\S+@\S+\.\S+$/.test(newUser.email)) {
      errors.email = 'Valid email is required';
    }
    if (!newUserPassword || newUserPassword.length < 8) {
      errors.password = 'Password is required (min 8 characters)';
    }
    if (!newUser.phone || !/^[6-9]\d{9}$/.test(newUser.phone)) {
      errors.phone = 'Phone number is required (10 digits, starts with 6-9)';
    }
    if (Object.keys(errors).length > 0) {
      showNotification(Object.values(errors).join(' | '), false);
      return;
    }
    
    try {
      setLoading(true);
      const result = await addUserWithDetailedAddress(newUser, newUserPassword);
      
      if (result.success) {
        showNotification('User created successfully');
        setModalOpen(false);
        fetchUsers(); // Refresh user list
        // Reset form
        setNewUser({
          name: "",
          email: "",
          phone: "",
          role: "customer",
          active: true,
          avatar: "",
          account_type: "",
          company_name: "",
          // Reset detailed address fields
          house_number: "",
          street_address: "",
          suite_unit_floor: "",
          locality: "",
          area: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
          landmark: ""
        });
        setNewUserPassword("");
      } else {
        showNotification(`Failed to create user: ${result.error}`, false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showNotification(`An error occurred: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async (userId, updatedData) => {
    try {
      setLoading(true);
      const result = await updateUserWithDetailedAddress(userId, updatedData);
      
      if (result.success) {
        showNotification('User updated successfully');
        fetchUsers(); // Refresh user list
      } else {
        showNotification(`Failed to update user: ${result.error}`, false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification(`An error occurred: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (userId, newStatus) => {
    try {
      setLoading(true);
      const result = await toggleUserStatus(userId, newStatus);
      
      if (result.success) {
        showNotification(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
        fetchUsers(); // Refresh user list
      } else {
        showNotification(`Failed to update user status: ${result.error}`, false);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      showNotification(`An error occurred: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  // Handle update user role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      setLoading(true);
      const result = await updateUserWithDetailedAddress(userId, { role: newRole });
      
      if (result.success) {
        showNotification(`User role updated to ${newRole} successfully`);
        fetchUsers(); // Refresh user list
      } else {
        showNotification(`Failed to update user role: ${result.error}`, false);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showNotification(`An error occurred: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  // Handle send password reset
  const handleSendPasswordReset = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (!error) {
        showNotification(`Password reset email sent to ${email}`);
      } else {
        showNotification(`Failed to send password reset: ${error.message}`, false);
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      showNotification(`An error occurred: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    return (
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter === "" || user.role === roleFilter) &&
      (statusFilter === "" || 
        (statusFilter === "active" && user.active) || 
        (statusFilter === "inactive" && !user.active))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const openAddModal = () => {
    setCurrentUser(null);
    setActiveTab("basic");
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "customer",
      active: true,
      avatar: "",
      account_type: "",
      company_name: "",
      // Detailed address fields
      house_number: "",
      street_address: "",
      suite_unit_floor: "",
      locality: "",
      area: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      landmark: ""
    });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    console.log("Opening edit modal for user:", user);
    console.log("User ID being set:", user.id);
    // Make a deep copy to ensure we have all properties
    setCurrentUser({...user});
    setActiveTab("basic");
    setModalOpen(true);
  };
  
  const handleTabChange = (value) => {
    console.log("Tab changed to:", value);
    console.log("Current user when changing tab:", currentUser);
    console.log("Current user ID:", currentUser?.id);
    setActiveTab(value);
  };

  const handleAddressUpdated = async () => {
    // Refresh the user list after addresses are updated
    console.log("Address updated, refreshing users list", new Date().toISOString());
    try {
      await fetchUsers();
      showNotification("User addresses updated successfully", true);
    } catch (error) {
      console.error("Error refreshing users after address update:", error);
      showNotification("Error refreshing user data", false);
    }
  };

  const handleSaveUser = () => {
    const today = formatDateOnlyIST(new Date());
    
    if (currentUser) {
      // Edit existing user
      setUsers(users.map(usr => 
        usr.id === currentUser.id ? { ...usr, ...newUser } : usr
      ));
    } else {
      // Add new user
      const newId = Math.max(...users.map(usr => usr.id)) + 1;
      setUsers([...users, { id: newId, joined: today, ...newUser }]);
    }
    setModalOpen(false);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
        setDeleteModalOpen(false);
        setUserToDelete(null);
        setNotification({
          type: 'success',
          message: 'User deleted successfully'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to delete user: ' + result.error
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to delete user: ' + error.message
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleActive = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ));
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ position: 'relative' }}>
      {loading && <LoadingOverlay visible={true} />}
      
      {notification && (
        <Notification
          color={notification.type === 'success' ? 'teal' : 'red'}
          title={notification.type === 'success' ? 'Success' : 'Error'}
          onClose={() => setNotification(null)}
          style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}
          withCloseButton
        >
          {notification.message}
        </Notification>
      )}
      
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Title order={3}>Users Management</Title>
          <Button 
            leftSection={<FaUserPlus />} 
            onClick={() => {
              setCurrentUser(null);
              setNewUser({
                name: "",
                email: "",
                phone: "",
                role: "customer",
                active: true,
                avatar: "",
                account_type: "",
                company_name: "",
                // Detailed address fields
                house_number: "",
                street_address: "",
                suite_unit_floor: "",
                locality: "",
                area: "",
                city: "",
                state: "",
                postal_code: "",
                country: "India",
                landmark: ""
              });
              setNewUserPassword("");
              setModalOpen(true);
            }}
          >
            Add User
          </Button>
        </Group>
      </Card.Section>

      {error && (
        <Text color="red" size="sm" mt="md">
          {error}
        </Text>
      )}

      <Group mt="md" mb="xs" style={{ flexWrap: "wrap" }}>
        <TextInput
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, minWidth: "250px" }}
          leftSection={<FaSearch size={14} />}
        />

        <Select
          placeholder="Filter by role"
          data={[
            { value: "", label: "All Roles" },
            { value: "admin", label: "Admin" },
            { value: "customer", label: "Customer" }
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ minWidth: "150px" }}
        />

        <Select
          placeholder="Filter by status"
          data={[
            { value: "", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" }
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ minWidth: "150px" }}
        />
      </Group>

      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <Table striped highlightOnHover withTableBorder style={{ tableLayout: 'fixed', minWidth: '1300px' }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "200px" }}>User</Table.Th>
              <Table.Th style={{ width: "220px" }}>Contact</Table.Th>
              <Table.Th style={{ width: "130px" }}>Role</Table.Th>
              <Table.Th style={{ width: "120px" }}>Status</Table.Th>
              <Table.Th style={{ width: "100px" }}>Joined</Table.Th>
              <Table.Th style={{ width: "180px" }}>Address</Table.Th>
              <Table.Th style={{ width: "120px" }}>Account Type</Table.Th>
              <Table.Th style={{ width: "120px" }}>Company</Table.Th>
              <Table.Th style={{ width: "140px" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
          {loading && users.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={9} style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                  <div className="spinner" style={{ 
                    width: "30px", 
                    height: "30px", 
                    border: "3px solid rgba(0, 0, 0, 0.1)", 
                    borderRadius: "50%", 
                    borderTopColor: "#4A90E2", 
                    animation: "spin 1s ease-in-out infinite" 
                  }}></div>
                  <Text mt="md" color="dimmed">Loading users...</Text>
                </div>
              </Table.Td>
            </Table.Tr>
          ) : paginatedUsers.length > 0 ? (
            paginatedUsers.map(user => (
              <Table.Tr key={user.id}>
                <Table.Td style={{ width: "200px" }}>
                  <Group gap="sm">
                    <Avatar src={user.avatar || `https://i.pravatar.cc/150?u=${user.email}`} size="md" radius="xl" />
                    <div style={{ overflow: 'hidden' }}>
                      <Text fw={500} style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td style={{ width: "220px" }}>
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <FaEnvelope size={12} style={{ marginRight: '6px', flexShrink: 0 }} /> 
                      <Text size="xs" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </Text>
                    </div>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaPhone size={12} style={{ marginRight: '6px', flexShrink: 0 }} /> 
                        <Text size="xs">{user.phone}</Text>
                      </div>
                    )}
                  </div>
                </Table.Td>
                <Table.Td style={{ width: "130px" }}>
                  <Badge
                    color={user.role === "admin" ? "red" : "blue"}
                    variant="light"
                    size="sm"
                    leftSection={user.role === "admin" ? 
                      <FaUserShield size={12} /> : 
                      <FaUserAlt size={12} />}
                    style={{ fontSize: '11px' }}
                  >
                    {user.role === "admin" ? "Admin" : "Customer"}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ width: "120px" }}>
                  <Switch
                    checked={user.active}
                    onChange={() => handleToggleStatus(user.id, !user.active)}
                    color="teal"
                    size="sm"
                    label={user.active ? "Active" : "Inactive"}
                    labelPosition="left"
                    styles={{
                      label: { fontSize: '12px' }
                    }}
                  />
                </Table.Td>
                <Table.Td style={{ width: "100px" }}>
                  <Text size="xs">{formatDateOnlyIST(user.joined)}</Text>
                </Table.Td>
                <Table.Td style={{ width: "180px" }}>
                  {user.fullAddress ? (
                    <Tooltip label={user.fullAddress} multiline width={300} withArrow>
                      <Text 
                        size="xs" 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          cursor: 'help'
                        }}
                      >
                        {user.fullAddress.length > 25 
                          ? `${user.fullAddress.substring(0, 25)}...` 
                          : user.fullAddress
                        }
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text size="xs" color="dimmed">-</Text>
                  )}
                </Table.Td>
                <Table.Td style={{ width: "120px" }}>
                  <Text 
                    size="xs" 
                    style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}
                  >
                    {user.account_type || "-"}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: "120px" }}>
                  <Text 
                    size="xs" 
                    style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}
                  >
                    {user.company_name || "-"}
                  </Text>
                </Table.Td>
                <Table.Td style={{ width: "140px" }}>
                  <Group gap="xs" justify="center">
                    <ActionIcon 
                      variant="light" 
                      color="blue"
                      size="sm"
                      onClick={() => {
                        setCurrentUser(user);
                        setModalOpen(true);
                      }}
                      title="Edit User"
                    >
                      <FaEdit size={14} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="light" 
                      color="yellow"
                      size="sm"
                      onClick={() => handleSendPasswordReset(user.email)}
                      title="Send Password Reset Email"
                    >
                      <FaKey size={14} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="light" 
                      color={user.active ? "red" : "green"}
                      size="sm"
                      onClick={() => handleToggleStatus(user.id, !user.active)}
                      title={user.active ? "Deactivate User" : "Activate User"}
                    >
                      {user.active ? <FaTimes size={14} /> : <FaCheck size={14} />}
                    </ActionIcon>
                    <ActionIcon 
                      variant="light" 
                      color="red"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      title="Delete User"
                    >
                      <FaTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={9} style={{ textAlign: "center" }}>
                <Text mt="md" color="dimmed">
                  No users found matching the search criteria
                </Text>
              </Table.Td>
            </Table.Tr>            )}
          </Table.Tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Group position="center" mt="xl">
          <Pagination 
            value={activePage} 
            onChange={setActivePage} 
            total={totalPages}
          />
        </Group>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveTab("basic"); // Reset tab when closing modal
        }}
        title={currentUser ? `Edit User: ${currentUser.name}` : "Add New User"}
        size="lg"
        styles={{
          body: {
            paddingTop: 0  // Remove extra padding at the top to make tabs look better
          }
        }}
        closeOnClickOutside={false} // Prevent accidental closing
      >
        <Tabs value={activeTab} onTabChange={handleTabChange} keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="basic" icon={<FaUserAlt size={14} />}>Basic Info</Tabs.Tab>
            {currentUser && (
              <Tabs.Tab 
                value="addresses" 
                icon={<FaMapMarkerAlt size={14} />}
                onClick={() => setActiveTab("addresses")} // Add explicit onClick handler
              >
                Addresses
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <TextInput
                label="Full Name"
                placeholder="Enter full name"
                required
                minLength={2}
                value={currentUser ? currentUser.name : newUser.name}
                onChange={(e) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, name: e.currentTarget.value });
                  } else {
                    setNewUser({ ...newUser, name: e.currentTarget.value });
                  }
                }}
                error={!currentUser && newUser.name && newUser.name.length < 2 ? 'Min 2 characters' : undefined}
              />

              <TextInput
                label="Email"
                placeholder="Enter email address"
                required
                type="email"
                value={currentUser ? currentUser.email : newUser.email}
                onChange={(e) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, email: e.currentTarget.value });
                  } else {
                    setNewUser({ ...newUser, email: e.currentTarget.value });
                  }
                }}
                disabled={currentUser} // Can't change email for existing users
              />

              {!currentUser && (
                <PasswordInput
                  label="Password"
                  placeholder="Enter secure password"
                  required
                  minLength={8}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.currentTarget.value)}
                  visibilityToggle
                />
              )}

              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                required
                maxLength={10}
                minLength={10}
                pattern="[6-9]{1}[0-9]{9}"
                value={currentUser ? currentUser.phone : newUser.phone}
                onChange={(e) => {
                  const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, phone: val });
                  } else {
                    setNewUser({ ...newUser, phone: val });
                  }
                }}
                error={!currentUser && newUser.phone && !/^[6-9]\d{9}$/.test(newUser.phone) ? '10 digits, starts with 6-9' : undefined}
              />

              <TextInput
                label="Account Type"
                placeholder="Enter account type"
                value={currentUser ? currentUser.account_type : newUser.account_type}
                onChange={(e) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, account_type: e.currentTarget.value });
                  } else {
                    setNewUser({ ...newUser, account_type: e.currentTarget.value });
                  }
                }}
              />

              <TextInput
                label="Company Name"
                placeholder="Enter company name"
                value={currentUser ? currentUser.company_name : newUser.company_name}
                onChange={(e) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, company_name: e.currentTarget.value });
                  } else {
                    setNewUser({ ...newUser, company_name: e.currentTarget.value });
                  }
                }}
              />

              <Select
                label="Role"
                placeholder="Select user role"
                data={[
                  { value: "admin", label: "Admin" },
                  { value: "customer", label: "Customer" }
                ]}
                value={currentUser ? currentUser.role : newUser.role}
                onChange={(value) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, role: value });
                  } else {
                    setNewUser({ ...newUser, role: value });
                  }
                }}
                required
              />

              <Switch
                label="Active"
                checked={currentUser ? currentUser.active : newUser.active}
                onChange={(event) => {
                  if (currentUser) {
                    setCurrentUser({ ...currentUser, active: event.currentTarget.checked });
                  } else {
                    setNewUser({ ...newUser, active: event.currentTarget.checked });
                  }
                }}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (currentUser) {
                      // Update existing user with all enhanced address fields
                      handleUpdateUser(currentUser.id, {
                        name: currentUser.name,
                        phone: currentUser.phone,
                        role: currentUser.role,
                        active: currentUser.active,
                        account_type: currentUser.account_type,
                        company_name: currentUser.company_name,
                        // Include all enhanced address fields
                        house_number: currentUser.house_number,
                        street_address: currentUser.street_address,
                        suite_unit_floor: currentUser.suite_unit_floor,
                        locality: currentUser.locality,
                        area: currentUser.area,
                        city: currentUser.city,
                        state: currentUser.state,
                        postal_code: currentUser.postal_code,
                        country: currentUser.country,
                        landmark: currentUser.landmark
                      });
                      setModalOpen(false);
                    } else {
                      // Create new user
                      handleCreateUser();
                    }
                  }}
                >
                  {currentUser ? "Update User" : "Create User"}
                </Button>
              </Group>
            </div>
          </Tabs.Panel>

          {currentUser && (
            <Tabs.Panel value="addresses" pt="xs">
              {activeTab === "addresses" && currentUser && currentUser.id && (
                <div>
                  <Text weight={500} mb="md">Manage User Addresses</Text>
                  <Text color="dimmed" size="sm" mb="md">
                    User ID: {currentUser.id}
                  </Text>
                  <UserAddressManager 
                    userId={currentUser.id}
                    onAddressChange={handleAddressUpdated}
                    key={`address-manager-${currentUser.id}-${new Date().getTime()}`} // Add key with timestamp to force re-render
                  />
                </div>
              )}
            </Tabs.Panel>
          )}
        </Tabs>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete User"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.
        </Text>
        {userToDelete && (
          <Group spacing="xs" mb="lg">
            <Avatar src={userToDelete.avatar} size="sm" />
            <div>
              <Text size="sm" weight={500}>{userToDelete.name}</Text>
              <Text size="xs" color="dimmed">{userToDelete.email}</Text>
            </div>
          </Group>
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
            onClick={confirmDeleteUser}
            loading={deleteLoading}
            leftIcon={<FaTrash />}
          >
            Delete User
          </Button>
        </Group>
      </Modal>
    </Card>
  );
};

export default UsersPage;
