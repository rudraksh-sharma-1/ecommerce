import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserAddresses } from "../utils/supabaseApi.js";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const stored = localStorage.getItem("selectedAddress");
    return stored ? JSON.parse(stored) : null;
  });

  const [addresses, setAddresses] = useState([]);
  const [currentLocationAddress, setCurrentLocationAddress] = useState(null); // NEW

  // ✅ Save selected address to localStorage
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
    }
  }, [selectedAddress]);

  // 🧠 Fetch saved user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser?.id) return;

      const { success, addresses, error } = await getUserAddresses(
        currentUser.id
      );
      if (!success) {
        console.error("Failed to fetch addresses:", error);
        return;
      }

      setAddresses(addresses);

      const defaultAddress = addresses.find((addr) => addr.is_default);
      if (!selectedAddress && defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    };

    fetchAddresses();
  }, [currentUser]);

  // 🌍 Function to get user's current location and reverse geocode it
  const useCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=f4a8c8f1a4c541f89f742dbc40672aea`
            );

            const data = await response.json();
            const result = data?.results?.[0];
            const address = result?.formatted;

            if (address) {
              const locationData = {
                address,
                latitude,
                longitude,
              };

              setSelectedAddress(locationData);
              setCurrentLocationAddress(address);
              localStorage.setItem(
                "selectedAddress",
                JSON.stringify(locationData)
              );
              resolve(locationData);
            } else {
              alert("Could not retrieve address.");
              reject("No address found");
            }
          } catch (error) {
            console.error("Reverse geocoding failed", error);
            alert("Failed to get address. Try again.");
            reject(error);
          }
        },
        (error) => {
          alert("Permission denied or location unavailable.");
          reject(error);
        }
      );
    });
  };

  const clearLocationData = () => {
    setSelectedAddress(null);
    setAddresses([]);
    setCurrentLocationAddress(null);
    localStorage.removeItem("selectedAddress");
  };

  return (
    <LocationContext.Provider
      value={{
        showModal,
        setShowModal,
        selectedAddress,
        setSelectedAddress,
        addresses,
        setAddresses,
        currentLocationAddress,
        setCurrentLocationAddress,
        useCurrentLocation,
        clearLocationData, // ✅ Exposed for external use
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
export default LocationContext;
