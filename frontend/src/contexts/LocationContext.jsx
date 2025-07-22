import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserAddresses } from "../utils/supabaseApi.js";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(() => {
    // 🔁 Load from localStorage on initial render
    const stored = localStorage.getItem("selectedAddress");
    return stored ? JSON.parse(stored) : null;
  });

  const [addresses, setAddresses] = useState([]);

  // ✅ Persist selectedAddress in localStorage
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
    }
  }, [selectedAddress]);

  // 🧠 Fetch addresses when user logs in or changes
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser?.id) return;

      const { success, addresses, error } = await getUserAddresses(currentUser.id);
      if (!success) {
        console.error("Failed to fetch addresses:", error);
        return;
      }

      setAddresses(addresses);

      // ✅ Auto-select default address only if no address is already selected
      const defaultAddress = addresses.find((addr) => addr.is_default);

      // Don't overwrite manually selected address unless none exists
      if (!selectedAddress && defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    };

    fetchAddresses();
  }, [currentUser]);

  return (
    <LocationContext.Provider
      value={{
        showModal,
        setShowModal,
        selectedAddress,
        setSelectedAddress,
        addresses,
        setAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
export default LocationContext;
