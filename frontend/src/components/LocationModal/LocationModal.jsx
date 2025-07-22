import React, { useState } from "react";
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LocationModal = () => {
  const {
    showModal,
    setShowModal,
    addresses,
    selectedAddress,
    setSelectedAddress,
  } = useLocationContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
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

            // Save as JSON string
            setSelectedAddress(locationData);

            alert("Location updated successfully!");
            setShowModal(false);
          } else {
            alert("Could not retrieve address.");
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          alert("Failed to get address. Try again.");
        }
      },
      (error) => {
        alert("Permission denied or location unavailable.");
      }
    );
  };

  const handleApplyPincode = async () => {
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `https://ecommerce-kghp.onrender.com/api/locationsroute/get-coordinates?pincode=${pincode}`
      );
      const { lat, lng } = res.data;

      const latitude = lat;
      const longitude = lng;

      const newSelected = {
        address_name: "Pincode Area",
        postal_code: pincode,
        latitude,
        longitude,
        is_custom: true,
      };

      setSelectedAddress(newSelected);
      localStorage.setItem("selectedAddress", JSON.stringify(newSelected));
      setShowModal(false);
    } catch (err) {
      console.error("Error getting coordinates:", err);
      alert("Couldn't find coordinates for this pincode.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-20000 flex justify-center items-end md:items-center">
      <div className="bg-white p-6 rounded-t-xl md:rounded-md w-full md:w-[400px] md:mb-0 mb-0 relative max-h-[90vh] overflow-y-auto transition-all duration-300">
        <button
          className="absolute top-2 right-4 text-gray-500 text-lg"
          onClick={() => setShowModal(false)}
        >
          ❌
        </button>

        <h2 className="text-lg font-bold mb-4">Choose your location</h2>

        {!currentUser ? (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm rounded-md p-3 mb-4">
            <p>You need to sign in to view your saved addresses.</p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/login");
              }}
              className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm mb-2">
                No saved addresses found.
              </p>
            ) : (
              addresses.map((addr, idx) => {
                const isSelected =
                  selectedAddress?.id && addr.id === selectedAddress.id;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setShowModal(false);
                    }}
                    className={`border p-3 rounded-md mb-2 cursor-pointer hover:bg-gray-100 transition ${
                      isSelected ? "bg-gray-200 border-blue-600" : ""
                    }`}
                  >
                    {addr.is_default && (
                      <p className="text-xs font-semibold text-green-600 mb-1">
                        Default Address
                      </p>
                    )}
                    <p className="font-bold">{addr.address_name}</p>
                    <p className="text-sm">{addr.street_address}</p>
                    <p className="text-sm">{addr.state}</p>
                    <p className="text-xs text-gray-500">{addr.postal_code}</p>

                    {isSelected && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        ✔ Currently Selected
                      </p>
                    )}
                  </div>
                );
              })
            )}

            <Link
              to="/account"
              state={{ horizontalTab: "personal", verticalTab: "addresses" }}
              onClick={() => setShowModal(false)}
              className="text-blue-600 text-sm underline block mt-2"
            >
              Add an Address or pickup point
            </Link>
          </>
        )}

        <p className="text-center text-sm mt-4">
          or please enter the pincode to check product availability
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2 mt-3">
          <input
            type="text"
            name="Pincode"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="border w-full sm:w-3/5 h-10 px-3 rounded-md"
          />
          <button
            onClick={handleApplyPincode}
            disabled={loading}
            className="border w-full sm:w-2/5 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        </div>
        <button
          className="text-blue-600 text-sm underline block mt-4"
          onClick={handleUseCurrentLocation}
        >
          Use my current location
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
