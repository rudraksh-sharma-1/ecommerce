import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaStar,
  FaPlus,
  FaMapMarkerAlt,
  FaExclamationTriangle
} from "react-icons/fa";

import AddressForm from "../AddressForm";
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setAddressAsDefault,
  migrateUserAddresses
} from "../../utils/supabaseApi";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Component to manage a user's multiple addresses
 * @param {Object} props
 * @param {Function} props.onAddressSelect - Callback for when an address is selected
 * @param {Function} props.onAddressChange - Callback for when addresses are changed
 * @param {Boolean} props.selectable - Whether addresses can be selected
 * @param {String} props.selectedAddressId - ID of currently selected address
 * @param {Function} props.onClose - Function to call to close the address manager
 */
const AddressManager = ({ 
  onAddressSelect,
  onAddressChange,
  onClose,
  selectable = false,
  selectedAddressId = null,
  userId = null
}) => {
  const { currentUser } = useAuth();
  const userIdToUse = userId || currentUser?.id;
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [editAddressModalOpen, setEditAddressModalOpen] = useState(false);
  const [deleteAddressModalOpen, setDeleteAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [migrated, setMigrated] = useState(true);
  const [migrateLoading, setMigrateLoading] = useState(false);

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
    if (!userIdToUse) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserAddresses(userIdToUse);
      
      if (result.success) {
        setAddresses(result.addresses || []);
        // If no addresses found, maybe we need to migrate from profile
        if ((result.addresses || []).length === 0) {
          setMigrated(false);
        } else {
          setMigrated(true);
        }
      } else {
        setError(result.error);
        console.error("Error loading addresses:", result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error in loadAddresses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load addresses on component mount and when userId changes
  useEffect(() => {
    if (userIdToUse) {
      loadAddresses();
    }
  }, [userIdToUse]);

  // Handle adding a new address
  const handleAddAddress = async (addressData) => {
    setActionLoading(true);
    
    try {
      const result = await addUserAddress(userIdToUse, addressData);
      
      if (result.success) {
        await loadAddresses();
        setAddAddressModalOpen(false);
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
        console.error("Error adding address:", result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error in handleAddAddress:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle updating an address
  const handleUpdateAddress = async (addressData) => {
    if (!currentAddress) return;
    
    setActionLoading(true);
    
    try {
      const result = await updateUserAddress(currentAddress.id, addressData);
      
      if (result.success) {
        await loadAddresses();
        setEditAddressModalOpen(false);
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
        console.error("Error updating address:", result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error in handleUpdateAddress:", error);
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
        console.error("Error deleting address:", result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error in handleDeleteAddress:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle setting an address as default
  const handleSetDefault = async (addressId) => {
    setLoading(true);
    
    try {
      const result = await setAddressAsDefault(userIdToUse, addressId);
      
      if (result.success) {
        await loadAddresses();
        if (onAddressChange) onAddressChange();
      } else {
        setError(result.error);
        console.error("Error setting default address:", result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error in handleSetDefault:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle migrating user address from profile
  const handleMigrateAddress = async () => {
    setMigrateLoading(true);
    
    try {
      const result = await migrateUserAddresses(userIdToUse);
      
      if (result.success) {
        await loadAddresses();
        setMigrated(true);
        if (onAddressChange) onAddressChange();
      } else {
        if (result.error === 'No address information to migrate' || 
            result.error === 'User already has migrated addresses') {
          setMigrated(true);
        } else {
          setError(result.error);
          console.error("Error migrating address:", result.error);
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error in handleMigrateAddress:", error);
    } finally {
      setMigrateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Manage Addresses</h2>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {!migrated && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Import Your Address</h3>
                  <div className="text-sm text-blue-700 mb-2">
                    We've updated our system to support multiple addresses. Would you like to import your existing address?
                  </div>
                  <button 
                    onClick={handleMigrateAddress}
                    disabled={migrateLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex justify-center"
                  >
                    {migrateLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importing...
                      </span>
                    ) : "Import Existing Address"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Addresses ({addresses.length})</h3>
            <button 
              onClick={() => setAddAddressModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-3 rounded-md flex items-center"
            >
              <FaPlus size={12} className="mr-1" /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-8 mb-4 text-center">
              <p className="text-gray-500">
                No addresses found. Click "Add New Address" to add one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`border ${selectable && selectedAddressId === address.id ? 'border-indigo-500' : 'border-gray-200'} rounded-md p-4 shadow-sm ${selectable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => selectable && onAddressSelect && onAddressSelect(address)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-indigo-500 mr-2" />
                      <span className="font-medium">{address.address_name}</span>
                      {address.is_default && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      {selectable && selectedAddressId === address.id && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!address.is_default && (
                        <button
                          title="Set as default"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address.id);
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50"
                        >
                          <FaStar size={16} />
                        </button>
                      )}
                      <button
                        title="Edit address"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentAddress(address);
                          setEditAddressModalOpen(true);
                        }}
                        className="text-indigo-500 hover:text-indigo-700 p-1.5 rounded-full hover:bg-indigo-50"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        title="Delete address"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentAddress(address);
                          setDeleteAddressModalOpen(true);
                        }}
                        disabled={addresses.length === 1 && address.is_default}
                        className={`${addresses.length === 1 && address.is_default ? 'text-gray-300' : 'text-red-500 hover:text-red-700 hover:bg-red-50'} p-1.5 rounded-full`}
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {formatAddress(address)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Address Form */}
        {addAddressModalOpen && (
          <div className="mt-6 mb-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Address</h2>
                <button 
                  onClick={() => setAddAddressModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() => setAddAddressModalOpen(false)}
                loading={actionLoading}
                isEdit={false}
              />
            </div>
          </div>
        )}

        {/* Edit Address Form */}
        {editAddressModalOpen && (
          <div className="mt-6 mb-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Address</h2>
                <button 
                  onClick={() => setEditAddressModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddressForm
                address={currentAddress}
                onSubmit={handleUpdateAddress}
                onCancel={() => setEditAddressModalOpen(false)}
                loading={actionLoading}
                isEdit={true}
              />
            </div>
          </div>
        )}

        {/* Delete Address Confirmation */}
        {deleteAddressModalOpen && (
          <div className="mt-6 mb-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Delete Address</h2>
              </div>
              <p className="mb-6">Are you sure you want to delete this address?</p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setDeleteAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                  onClick={handleDeleteAddress}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          {onClose && (
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Close
            </button>
          )}
        </div>
    </div>
  );
};

export default AddressManager;
