import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfileWithAddress, getWishlistItems, removeFromWishlist, getUserEnquiries } from '../../utils/supabaseApi';
import { formatDateOnlyIST } from '../../utils/dateUtils';
import supabase from '../../utils/supabase.ts';
import { FaUserEdit, FaHeart, FaLock, FaTrash, FaClock, FaEye, FaEyeSlash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaShoppingBag, FaHistory, FaShoppingCart } from 'react-icons/fa';
import { BiMessageRounded } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import AddressManager from '../../components/AddressManager';

const AccountPage = () => {
  const { currentUser, logout, userRole, resetPassword, updatePassword, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  
  // Horizontal tabs
  const horizontalTabs = [
    { key: 'personal', label: 'Personal Details' },
    { key: 'account', label: 'My Account' },
    { key: 'repeat', label: 'Repeat Order' }
  ];

  // Vertical tabs for each horizontal section
  const verticalTabs = {
    personal: [
      { key: 'profile', label: 'Edit Profile', icon: <FaUserEdit /> },
      { key: 'addresses', label: 'Delivery Address', icon: <FaMapMarkerAlt /> },
      { key: 'contact', label: 'Contact No', icon: <FaPhone /> },
      { key: 'email', label: 'Email Id', icon: <FaEnvelope /> }
    ],
    account: [
      { key: 'orders', label: 'My Orders', icon: <FaShoppingBag /> },
      { key: 'security', label: 'Security', icon: <FaLock /> }
    ],
    repeat: [
      { key: 'past-orders', label: 'Past Orders', icon: <FaHistory /> },
      { key: 'cart', label: 'Cart', icon: <FaShoppingCart /> }
    ]
  };

  const [activeHorizontalTab, setActiveHorizontalTab] = useState('personal');
  const [activeVerticalTab, setActiveVerticalTab] = useState('profile');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || currentUser?.user_metadata?.name || '',
    phone: currentUser?.phone || currentUser?.user_metadata?.phone || '',
    address: currentUser?.address || currentUser?.user_metadata?.address || '',
    // Detailed address fields
    houseNumber: currentUser?.house_number || '',
    streetAddress: currentUser?.street_address || '',
    suiteUnitFloor: currentUser?.suite_unit_floor || '',
    locality: currentUser?.locality || '',
    area: currentUser?.area || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    postalCode: currentUser?.postal_code || '',
    country: currentUser?.country || 'India',
    landmark: currentUser?.landmark || ''
  });
  const [wishlist, setWishlist] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (!currentUser) navigate('/login');
    else {
      (async () => {
        // Check for user profile in localStorage first
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed && parsed.id === currentUser.id) {
            setProfileData(prev => ({
              ...prev,
              ...parsed
            }));
          }
        }
      })();
    }
  }, [currentUser, navigate]);

  // Fetch wishlist data
  const fetchWishlist = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const { success, wishlistItems } = await getWishlistItems(currentUser.id);
      setWishlist(success && wishlistItems ? wishlistItems : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    }
    setLoading(false);
  };

  // Fetch enquiries data
  const fetchEnquiries = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const { success, enquiries } = await getUserEnquiries(currentUser.id);
      if (success && enquiries) {
        setEnquiries(enquiries);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setEnquiries([]);
    }
    setLoading(false);
  };

  // Update vertical tab when horizontal tab changes
  useEffect(() => {
    const firstVerticalTab = verticalTabs[activeHorizontalTab]?.[0]?.key;
    if (firstVerticalTab) {
      setActiveVerticalTab(firstVerticalTab);
    }
  }, [activeHorizontalTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: user, error } = await updateUserProfileWithAddress(currentUser.id, profileData);
      
      if (error) {
        throw error;
      }
      
      setNotification({ show: true, message: 'Profile updated successfully!', type: 'success' });
      
      // Update the context with new user data
      if (user) {
        setCurrentUser(prev => ({
          ...prev,
          ...user,
          // Ensure the transformed fields are available
          name: user.name,
          phone: user.phone,
          address: user.address,
          houseNumber: user.houseNumber,
          streetAddress: user.streetAddress,
          suiteUnitFloor: user.suiteUnitFloor,
          locality: user.locality,
          area: user.area,
          city: user.city,
          state: user.state,
          postalCode: user.postalCode,
          country: user.country,
          landmark: user.landmark
        }));
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setNotification({ show: true, message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setNotification({ show: true, message: 'All password fields are required', type: 'danger' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ show: true, message: 'New passwords do not match', type: 'danger' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setNotification({ show: true, message: 'Password must be at least 6 characters long', type: 'danger' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setNotification({ show: true, message: 'Password updated successfully!', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const userEmail = currentUser?.email;
      if (!userEmail) {
        throw new Error('No email found for password reset');
      }
      const result = await resetPassword(userEmail);
      setNotification({ show: true, message: 'Reset email sent! Check your inbox.', type: 'success' });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRemoveFromWishlist = async (wishlistItemId) => {
    setLoading(true);
    try {
      const { success, error } = await removeFromWishlist(wishlistItemId);
      if (success) {
        setWishlist(prev => prev.filter(item => item.wishlist_item_id !== wishlistItemId));
        setNotification({ show: true, message: 'Item removed from wishlist', type: 'success' });
      } else {
        setNotification({ show: true, message: error || 'Error removing item from wishlist', type: 'danger' });
      }
    } catch (error) {
      setNotification({ show: true, message: 'Error removing item from wishlist', type: 'danger' });
    }
    setLoading(false);
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span>Profile</span>
            <span className="mx-2">{'>'}</span>
            <span className="text-indigo-600 font-medium">My Account</span>
          </div>
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>

        {notification.show && (
          <div className={`mb-4 px-4 py-2 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
          </div>
        )}

        {/* Horizontal Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {horizontalTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveHorizontalTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeHorizontalTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              {verticalTabs[activeHorizontalTab]?.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveVerticalTab(tab.key)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                    activeVerticalTab === tab.key
                      ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
              {activeHorizontalTab === 'personal' && (
                <>
                  {activeVerticalTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaUserEdit className="text-indigo-600" />
                        Edit Profile
                      </h2>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={e => setProfileData({...profileData, name: e.target.value})}
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
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeVerticalTab === 'addresses' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-indigo-600" />
                        Delivery Address
                      </h2>
                      <AddressManager
                        userId={currentUser.id}
                        onAddressChange={() => {
                          setNotification({ show: true, message: 'Address updated successfully!', type: 'success' });
                          setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                        }}
                      />
                    </div>
                  )}

                  {activeVerticalTab === 'contact' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaPhone className="text-indigo-600" />
                        Contact Number
                      </h2>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={e => setProfileData({...profileData, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update Contact'}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeVerticalTab === 'email' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600" />
                        Email Address
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={currentUser?.email || ''}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-2">Email address cannot be changed. Contact support if you need to update your email.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* My Account Content */}
              {activeHorizontalTab === 'account' && (
                <>
                  {activeVerticalTab === 'orders' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaShoppingBag className="text-indigo-600" />
                        My Orders
                      </h2>
                      <div className="text-center py-12">
                        <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Order Management Coming Soon</h3>
                        <p className="text-gray-500 mb-4">We're working on bringing you a comprehensive order tracking system.</p>
                        <Link
                          to="/coming-soon?feature=orders"
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeVerticalTab === 'security' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaLock className="text-indigo-600" />
                        Security Settings
                      </h2>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            >
                              {showPasswords.current ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter new password (min 6 characters)"
                              minLength="6"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            >
                              {showPasswords.new ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            >
                              {showPasswords.confirm ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">Account Information</h3>
                        <div className="text-sm text-gray-600">
                          <p>Email: {currentUser?.email}</p>
                          <p>Account created: {currentUser?.created_at ? formatDateOnlyIST(currentUser.created_at) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Repeat Order Content */}
              {activeHorizontalTab === 'repeat' && (
                <>
                  {activeVerticalTab === 'past-orders' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaHistory className="text-indigo-600" />
                        Past Orders
                      </h2>
                      <div className="text-center py-12">
                        <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Order History Coming Soon</h3>
                        <p className="text-gray-500 mb-4">We're developing a comprehensive order history feature for easy reordering.</p>
                        <Link
                          to="/coming-soon?feature=orders"
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeVerticalTab === 'cart' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaShoppingCart className="text-indigo-600" />
                        Shopping Cart
                      </h2>
                      <div className="text-center py-12">
                        <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">View Your Cart</h3>
                        <p className="text-gray-500 mb-4">Check your current cart items and proceed to checkout.</p>
                        <Link
                          to="/cart"
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Go to Cart
                        </Link>
                      </div>
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
