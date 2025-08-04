import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserAddresses } from "../utils/supabaseApi.js";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("visibility"); // or "order"
  const [locationCleared, setLocationcleared] = useState(() => {
    const stored = localStorage.getItem("locationCleared");
    return stored === "true"; // string comparison
  });
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const stored = localStorage.getItem("selectedAddress");
    return stored ? JSON.parse(stored) : null;
  });

  const [orderAddress, setOrderAddress] = useState(() => {
    const stored = localStorage.getItem("orderAddress");
    return stored ? JSON.parse(stored) : null;
  });

  const [addresses, setAddresses] = useState([]);
  const [currentLocationAddress, setCurrentLocationAddress] = useState(null); // NEW

  useEffect(() => {
    if (orderAddress) {
      localStorage.setItem("orderAddress", JSON.stringify(orderAddress));
    }
  }, [orderAddress]);

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
      if (!selectedAddress && defaultAddress && locationCleared == false) {
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
            console.log("OpenCage components:", data?.results?.[0]?.components);

            const address = result?.formatted;
            const components = result?.components || {};

            if (address) {
              const locationData = {
                id: null, // no DB id for geolocation
                house_number: "",
                street_address: result?.components?.road || "",
                city: result?.components?.city || result?.components?.town || "",
                state: result?.components?.state || "",
                postal_code: result?.components?.postcode || "",
                country: result?.components?.country || "",
                latitude,
                longitude,
                formatted_address: address,
                is_geolocation: true
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

  useEffect(() => {
    localStorage.setItem("locationCleared", locationCleared.toString());
  }, [locationCleared]);


  const clearLocationData = () => {
    setSelectedAddress(null);
    setOrderAddress(null);
    setCurrentLocationAddress(null);
    localStorage.removeItem("selectedAddress");
    localStorage.removeItem("orderAddress");
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
        clearLocationData,
        orderAddress,
        setOrderAddress, // ✅ Exposed for external use
        modalMode,
        setModalMode,
        locationCleared,
        setLocationcleared,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
export default LocationContext;
