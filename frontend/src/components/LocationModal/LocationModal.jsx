import React, { useState, useEffect } from "react";
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LocateFixed } from "lucide-react";

const LocationModal = () => {
  const {
    showModal,
    setShowModal,
    modalMode,
    setModalMode,
    addresses,
    selectedAddress,
    setSelectedAddress,
    currentLocationAddress,
    setCurrentLocationAddress,
    useCurrentLocation,
    orderAddress,
    setOrderAddress,
    clearLocationData,
    setLocationcleared,
  } = useLocationContext();

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleclearlocationdata = () => {
    try {
      setResetLoading(true)
      clearLocationData();
      setLocationcleared(true)
      setShowModal(false);
      alert("Location Reset")
    } catch (error) {
      alert("Error resetting Location:", error)
    } finally {
      setResetLoading(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const result = await useCurrentLocation();
      setLocationcleared(false);
      alert("Location updated successfully!");
    } catch (err) {
      console.error("Failed to fetch current location:", err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleApplyPincode = async () => {
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `https://ecommerce-wvkv.onrender.com/api/locationsroute/get-coordinates?pincode=${pincode}`
      );
      const { lat, lng, state } = res.data;

      const latitude = lat;
      const longitude = lng;
      const State = state

      const newSelected = {
        address_name: "Pincode Area",
        postal_code: pincode,
        state: State,
        latitude,
        longitude,
        is_custom: true,
      };

      setSelectedAddress(newSelected);
      setCurrentLocationAddress(null);
      setLocationcleared(false)
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
      <div className="bg-white p-6 rounded-t-xl md:rounded-md w-full md:w-[400px] md:mb-0 mb-0 relative transition-all duration-300 max-h-full md:max-h-[90vh] md:overflow-y-auto">
        <button
          className="absolute top-2 right-4 text-gray-500 text-lg"
          onClick={() => setShowModal(false)}
        >
          ❌
        </button>

        <h2 className="text-lg font-bold mb-4">
          {modalMode === "order" ? "Choose your delivery address" : "Choose your location"}
        </h2>


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
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-1 py-2">
              {addresses.map((addr, idx) => {
                const isSelected =
                  selectedAddress?.id && addr.id === selectedAddress.id;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setOrderAddress(addr);
                      setCurrentLocationAddress(null);
                      setLocationcleared(false);
                      setShowModal(false);
                    }}
                    className={`min-w-[47%] border p-3 rounded-md cursor-pointer hover:bg-gray-100 transition shrink-0 ${isSelected ? "bg-gray-200 border-blue-600" : ""
                      }`}
                  >
                    {addr.is_default && (
                      <p className="text-xs font-semibold text-green-600 mb-1">
                        Default Address
                      </p>
                    )}
                    <p className="font-bold text-sm">{addr.address_name}</p>
                    <p className="text-xs">{addr.street_address}</p>
                    <p className="text-xs">{addr.state}</p>
                    <p className="text-xs text-gray-500">{addr.postal_code}</p>

                    {isSelected && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        ✔ Currently Selected
                      </p>
                    )}
                  </div>
                );
              })}
            </div>


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

        {modalMode !== "order" && (
          <>
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
              className="flex align-middle cursor-pointer justify-evenly w-43 no-underline text-blue-600 text-sm mt-4 disabled:opacity-60"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
            >
              <LocateFixed size={18} className="pt-1" />
              {locationLoading ? "Fetching..." : "Use my current location"}
            </button>

            {currentLocationAddress && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-center cursor-pointer">
                📍 <span className="font-medium cursor-pointer">Current Location:</span>{" "}
                {currentLocationAddress}
              </div>
            )}

            <button
              onClick={handleclearlocationdata}
              disabled={resetLoading}
              className="border w-full mt-4 sm:w-2/5 h-10 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {resetLoading ? "Resetting..." : "Reset Location"}
            </button>

          </>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
