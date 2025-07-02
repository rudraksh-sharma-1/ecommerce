import React, { useState, useEffect } from "react";
import { 
  Box,
  Card, 
  Text, 
  Group, 
  Button, 
  Stack,
  ActionIcon,
  Badge,
  Modal,
  LoadingOverlay,
  Tooltip,
  Divider
} from "@mantine/core";
import { 
  FaEdit, 
  FaTrash, 
  FaStar, 
  FaPlus,
  FaMapMarkerAlt
} from "react-icons/fa";

import AddressForm from "./AddressForm";
import { 
  getUserAddresses, 
  addUserAddress, 
  updateUserAddress, 
  deleteUserAddress,
  setAddressAsDefault
} from "../utils/supabaseApi";
import supabase, { supabaseAdmin } from "../utils/supabase";

/**
 * Component to manage a user's multiple addresses
 * @param {Object} props
 * @param {String} props.userId - ID of the user whose addresses to manage
 * @param {Function} props.onAddressChange - Callback for when addresses are changed
 */
const UserAddressManager = ({ userId, onAddressChange }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [editAddressModalOpen, setEditAddressModalOpen] = useState(false);
  const [deleteAddressModalOpen, setDeleteAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Format address for display
  const formatAddress = (address) => {
    const parts = [
      address.house_number,
      address.street_address,
      address.suite_unit_floor,
      address.locality,
      address.area,
      address.city,
      address.state,
      address.postal_code,
      address.country,
      address.landmark
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  // Load user addresses
  const loadAddresses = async () => {
    if (!userId) {
      setError("No user ID provided");
      setAddresses([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Try admin client first (bypasses RLS)
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
        
      if (!adminError) {
        setAddresses(adminData || []);
        return;
      }
      
      // Fallback to API function
      const result = await getUserAddresses(userId);
      
      if (result.success) {
        setAddresses(result.addresses || []);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load addresses on component mount and when userId changes
  useEffect(() => {
    if (userId) {
      // Small timeout to ensure the component is fully mounted
      setTimeout(() => {
        loadAddresses();
      }, 100);
    } else {
      setAddresses([]);
    }
  }, [userId]);

  // Handle adding a new address
  const handleAddAddress = async (addressData) => {
    setActionLoading(true);
    
    try {
      const result = await addUserAddress(userId, addressData);
      
      if (result.success) {
        await loadAddresses();
        setAddAddressModalOpen(false);
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle updating an address
  const handleUpdateAddress = async (addressData) => {
    if (!currentAddress) {
      setError("No address selected for update");
      return;
    }
    
    setActionLoading(true);
    
    try {
      const result = await updateUserAddress(currentAddress.id, addressData);
      
      if (result.success) {
        await loadAddresses();
        setEditAddressModalOpen(false);
        setCurrentAddress(null);
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deleting an address
  const handleDeleteAddress = async () => {
    if (!currentAddress) return;
    
    setActionLoading(true);
    
    try {
      const result = await deleteUserAddress(currentAddress.id);
      
      if (result.success) {
        await loadAddresses();
        setDeleteAddressModalOpen(false);
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle setting an address as default
  const handleSetDefault = async (addressId) => {
    setLoading(true);
    
    try {
      const result = await setAddressAsDefault(userId, addressId);
      
      if (result.success) {
        await loadAddresses();
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <Box pos="relative" pb="md">
      <LoadingOverlay visible={loading} />
      
      {error && (
        <Text color="red" mb="md">
          Error: {error}
        </Text>
      )}

      <Group position="apart" mb="md">
        <Text weight={500} size="lg">
          Addresses ({addresses.length})
        </Text>
        <Button 
          leftIcon={<FaPlus size={14} />} 
          onClick={() => setAddAddressModalOpen(true)}
          size="sm"
        >
          Add New Address
        </Button>
      </Group>

      {addresses.length === 0 ? (
        <Card p="xl" withBorder mb="md">
          <Text align="center" color="dimmed" mb="md">
            No addresses found. Click "Add New Address" to add one.
          </Text>
        </Card>
      ) : (
        <Stack spacing="md">
          {addresses.map((address) => (
            <Card key={address.id} withBorder p="md" radius="md">
              <Group position="apart">
                <Group>
                  <FaMapMarkerAlt />
                  <Text weight={500}>{address.address_name}</Text>
                  {address.is_default && (
                    <Badge color="blue">Default</Badge>
                  )}
                </Group>
                <Group spacing="xs">
                  {!address.is_default && (
                    <Tooltip label="Set as default">
                      <ActionIcon 
                        color="blue" 
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <FaStar size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="Edit address">
                    <ActionIcon 
                      color="blue" 
                      onClick={() => {
                        setCurrentAddress(address);
                        setEditAddressModalOpen(true);
                      }}
                    >
                      <FaEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete address">
                    <ActionIcon 
                      color="red" 
                      onClick={() => {
                        setCurrentAddress(address);
                        setDeleteAddressModalOpen(true);
                      }}
                      disabled={addresses.length === 1 && address.is_default}
                    >
                      <FaTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
              
              <Divider my="sm" />
              
              <Text size="sm">{formatAddress(address)}</Text>
            </Card>
          ))}
        </Stack>
      )}

      {/* Add Address Modal */}
      <Modal
        opened={addAddressModalOpen}
        onClose={() => setAddAddressModalOpen(false)}
        title="Add New Address"
        size="lg"
      >
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setAddAddressModalOpen(false)}
          loading={actionLoading}
          isEdit={false}
        />
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        opened={editAddressModalOpen}
        onClose={() => setEditAddressModalOpen(false)}
        title="Edit Address"
        size="lg"
      >
        <AddressForm
          address={currentAddress}
          onSubmit={handleUpdateAddress}
          onCancel={() => setEditAddressModalOpen(false)}
          loading={actionLoading}
          isEdit={true}
        />
      </Modal>

      {/* Delete Address Modal */}
      <Modal
        opened={deleteAddressModalOpen}
        onClose={() => setDeleteAddressModalOpen(false)}
        title="Delete Address"
        size="sm"
      >
        <Text mb="lg">Are you sure you want to delete this address?</Text>
        <Group position="right">
          <Button
            variant="subtle"
            onClick={() => setDeleteAddressModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeleteAddress}
            loading={actionLoading}
          >
            Delete
          </Button>
        </Group>
      </Modal>


    </Box>
  );
};

export default UserAddressManager;
