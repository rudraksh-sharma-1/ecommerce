import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserProfileWithAddress } from "../../utils/supabaseApi";
import { formatDateOnlyIST } from "../../utils/dateUtils";
import supabase from "../../utils/supabase.ts";
import {
  FaUserEdit,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaShoppingBag,
  FaHistory,
  FaShoppingCart,
} from "react-icons/fa";
import AddressManager from "../../components/AddressManager";
import ComingSoonPlaceholder from "../../components/ComingSoonPlaceholder";
import { useLocation } from "react-router-dom";

const AccountPage = () => {
  const { currentUser, logout, resetPassword, updatePassword, setCurrentUser } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Tab configuration
  const TAB_CONFIG = {
    horizontal: [
      { key: "personal", label: "Personal Details" },
      { key: "account", label: "My Account" },
      { key: "repeat", label: "Repeat Order" },
    ],
    vertical: {
      personal: [
        { key: "profile", label: "Edit Profile", icon: <FaUserEdit /> },
        {
          key: "addresses",
          label: "Delivery Address",
          icon: <FaMapMarkerAlt />,
        },
        {
          key: "contact",
          label: "Contact No",
          icon: <FaPhone className="transform rotate-90" />,
        },
        { key: "email", label: "Email Id", icon: <FaEnvelope /> },
      ],
      account: [
        { key: "orders", label: "My Orders", icon: <FaShoppingBag /> },
        { key: "security", label: "Security", icon: <FaLock /> },
      ],
      repeat: [
        { key: "past-orders", label: "Past Orders", icon: <FaHistory /> },
        { key: "cart", label: "Cart", icon: <FaShoppingCart /> },
      ],
    },
  };

  // State management
  const [activeHorizontalTab, setActiveHorizontalTab] = useState(
    state.horizontalTab || "personal"
  );
  const [activeVerticalTab, setActiveVerticalTab] = useState(
    state.verticalTab || "profile"
  );
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || currentUser?.user_metadata?.name || "",
    phone: currentUser?.phone || currentUser?.user_metadata?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Utility functions
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Effects
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Initialize profile data from current user
    setProfileData({
      name: currentUser?.name || currentUser?.user_metadata?.name || "",
      phone: currentUser?.phone || currentUser?.user_metadata?.phone || "",
    });

    // Load cached profile data
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.id === currentUser.id) {
          setProfileData((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            phone: parsed.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Error parsing stored profile:", error);
      }
    }
  }, [currentUser, navigate]);

  // Update vertical tab when horizontal tab changes
  useEffect(() => {
    // only override vertical tab if it wasn't passed via navigation state
    if (!state.verticalTab) {
      const firstVerticalTab =
        TAB_CONFIG.vertical[activeHorizontalTab]?.[0]?.key;
      if (firstVerticalTab) {
        setActiveVerticalTab(firstVerticalTab);
      }
    }
  }, [activeHorizontalTab, state.verticalTab]);

  // Event handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, user, error } = await updateUserProfileWithAddress(
        currentUser.id,
        profileData
      );

      if (!success || error) {
        throw new Error(error || "Failed to update profile");
      }

      showNotification("Profile updated successfully!");

      if (user) {
        setCurrentUser(user);
        localStorage.setItem("userProfile", JSON.stringify(user));
        // Update profile data state
        setProfileData({
          name: user.name || "",
          phone: user.phone || "",
        });
      }
    } catch (err) {
      console.error("Profile update error:", err);
      showNotification(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showNotification("All password fields are required", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    setLoading(true);
    try {
      // First, verify the current password by attempting to sign in
      const { data: verifyData, error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: passwordData.currentPassword,
        });

      if (verifyError) {
        throw new Error("Current password is incorrect");
      }

      // If current password is correct, update to new password
      const { success, error } = await updatePassword(passwordData.newPassword);

      if (!success || error) {
        throw new Error(error || "Failed to update password");
      }

      showNotification("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showNotification(err.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const userEmail = currentUser?.email;
      if (!userEmail) throw new Error("No email found for password reset");

      const { success, error } = await resetPassword(userEmail);

      if (!success || error) {
        throw new Error(error || "Failed to send reset email");
      }

      showNotification("Reset email sent! Check your inbox.");
    } catch (err) {
      showNotification(err.message || "Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span>Profile</span>
            <span className="mx-2">{">"}</span>
            <span className="text-indigo-600 font-medium">My Account</span>
          </div>
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>

        {notification.show && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Horizontal Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {TAB_CONFIG.horizontal.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveHorizontalTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeHorizontalTab === tab.key
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Vertical Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              {TAB_CONFIG.vertical[activeHorizontalTab]?.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveVerticalTab(tab.key)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                    activeVerticalTab === tab.key
                      ? "bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Personal Details Content */}
              {activeHorizontalTab === "personal" && (
                <>
                  {activeVerticalTab === "profile" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaUserEdit className="text-indigo-600" />
                        Edit Profile
                      </h2>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeVerticalTab === "addresses" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-indigo-600" />
                        Delivery Address
                      </h2>
                      <AddressManager
                        userId={currentUser.id}
                        onAddressChange={() =>
                          showNotification("Address updated successfully!")
                        }
                      />
                    </div>
                  )}

                  {activeVerticalTab === "contact" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaPhone className="text-indigo-600 transform rotate-90" />
                        Contact Number
                      </h2>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Contact"}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeVerticalTab === "email" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600" />
                        Email Address
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={currentUser?.email || ""}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Email address cannot be changed. Contact support if
                          you need to update your email.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* My Account Content */}
              {activeHorizontalTab === "account" && (
                <>
                  {activeVerticalTab === "orders" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaShoppingBag className="text-indigo-600" />
                        My Orders
                      </h2>
                      <ComingSoonPlaceholder
                        icon={FaShoppingBag}
                        title="Order Management Coming Soon"
                        description="We're working on bringing you a comprehensive order tracking system."
                        linkTo="/coming-soon?feature=orders"
                      />
                    </div>
                  )}

                  {activeVerticalTab === "security" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaLock className="text-indigo-600" />
                        Security Settings
                      </h2>
                      <form
                        onSubmit={handlePasswordChange}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() =>
                                togglePasswordVisibility("current")
                              }
                            >
                              {showPasswords.current ? (
                                <FaEyeSlash className="text-gray-400" />
                              ) : (
                                <FaEye className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter new password (min 6 characters)"
                              minLength="6"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => togglePasswordVisibility("new")}
                            >
                              {showPasswords.new ? (
                                <FaEyeSlash className="text-gray-400" />
                              ) : (
                                <FaEye className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() =>
                                togglePasswordVisibility("confirm")
                              }
                            >
                              {showPasswords.confirm ? (
                                <FaEyeSlash className="text-gray-400" />
                              ) : (
                                <FaEye className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                        <button
                          type="button"
                          onClick={handlePasswordReset}
                          className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Sending..." : "Reset Password via Email"}
                        </button>
                      </form>
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">
                          Account Information
                        </h3>
                        <div className="text-sm text-gray-600">
                          <p>Email: {currentUser?.email}</p>
                          <p>
                            Phone:{" "}
                            {currentUser?.phone ||
                              currentUser?.user_metadata?.phone ||
                              "Not provided"}
                          </p>
                          <p>
                            Account created:{" "}
                            {currentUser?.created_at
                              ? formatDateOnlyIST(currentUser.created_at)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Repeat Order Content */}
              {activeHorizontalTab === "repeat" && (
                <>
                  {activeVerticalTab === "past-orders" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaHistory className="text-indigo-600" />
                        Past Orders
                      </h2>
                      <ComingSoonPlaceholder
                        icon={FaHistory}
                        title="Order History Coming Soon"
                        description="We're developing a comprehensive order history feature for easy reordering."
                        linkTo="/coming-soon?feature=orders"
                      />
                    </div>
                  )}

                  {activeVerticalTab === "cart" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaShoppingCart className="text-indigo-600" />
                        Shopping Cart
                      </h2>
                      <ComingSoonPlaceholder
                        icon={FaShoppingCart}
                        title="View Your Cart"
                        description="Check your current cart items and proceed to checkout."
                        linkTo="/cart"
                        linkText="Go to Cart"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaLock className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
