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
        const { getUserProfileWithAddress } = await import('../../utils/supabaseApi');
        const result = await getUserProfileWithAddress(currentUser.id);
        if (result.success && result.user) {
          setProfileData({
            name: result.user.name || '',
            phone: result.user.phone || '',
            address: result.user.address || '',
            houseNumber: result.user.houseNumber || '',
            streetAddress: result.user.streetAddress || '',
            suiteUnitFloor: result.user.suiteUnitFloor || '',
            locality: result.user.locality || '',
            area: result.user.area || '',
            city: result.user.city || '',
            state: result.user.state || '',
            postalCode: result.user.postalCode || '',
            country: result.user.country || 'India',
            landmark: result.user.landmark || ''
          });
        } else {
          // fallback to auth user object if DB fetch fails
          setProfileData({
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
      const { success, enquiries: userEnquiries } = await getUserEnquiries(currentUser.id);
      setEnquiries(success && userEnquiries ? userEnquiries : []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setEnquiries([]);
    }
    setLoading(false);
  };

  // Fetch data based on active vertical tab
  useEffect(() => {
    if (activeVerticalTab === 'wishlist') {
      fetchWishlist();
    } else if (activeVerticalTab === 'enquiry') {
      fetchEnquiries();
    }
  }, [activeVerticalTab, currentUser?.id]);

  // Update vertical tab when horizontal tab changes
  useEffect(() => {
    const firstVerticalTab = verticalTabs[activeHorizontalTab]?.[0]?.key;
    if (firstVerticalTab) {
      setActiveVerticalTab(firstVerticalTab);
    }
  }, [activeHorizontalTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Use the new detailed address API function
      const { success, user, error } = await updateUserProfileWithAddress(currentUser.id, profileData);
      
      if (!success) throw new Error(error);
      
      setNotification({ show: true, message: 'Profile updated successfully!', type: 'success' });
      
      // Update the current user context with new data
      if (user) {
        setCurrentUser(prevUser => ({
          ...prevUser,
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
      setNotification({ show: true, message: 'Please fill all password fields', type: 'danger' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({ show: true, message: 'Passwords do not match', type: 'danger' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setNotification({ show: true, message: 'Password must be at least 6 characters', type: 'danger' });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
      return;
    }
    
    try {
      setLoading(true);
      
      const userEmail = currentUser?.email;
      if (!userEmail) {
        setNotification({ show: true, message: 'Email not found. Please log out and log back in.', type: 'danger' });
        return;
      }
      
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: passwordData.currentPassword
      });
      
      if (signInError) {
        setNotification({ show: true, message: 'Current password is incorrect', type: 'danger' });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        return;
      }
      
      // Update password directly
      const result = await updatePassword(passwordData.newPassword);
      
      if (result.success) {
        setNotification({ show: true, message: 'Password updated successfully!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setNotification({ show: true, message: result.error || 'Failed to update password', type: 'danger' });
      }
    } catch (err) {
      setNotification({ show: true, message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const userEmail = currentUser?.email;
      if (!userEmail) {
        setNotification({ show: true, message: 'Email not found. Please log out and log back in.', type: 'danger' });
        return;
      }
      const result = await resetPassword(userEmail);
      setNotification({ show: true, message: 'Reset email sent! Check your inbox.', type: 'success' });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: 'danger' });
    } finally {
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
        setWishlist(wishlist.filter(item => item.wishlist_item_id !== wishlistItemId));
        window.dispatchEvent(new Event('wishlistUpdated'));
        setNotification({ show: true, message: 'Item removed from wishlist', type: 'success' });
      } else {
        setNotification({ show: true, message: error || 'Failed to remove item', type: 'danger' });
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
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        {notification.show && (
          <div className={`mb-4 px-4 py-2 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> {notification.message} </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="bg-white p-4 rounded-lg shadow space-y-2">
            {verticalTabs[activeHorizontalTab]?.map(tab => (
              <button key={tab.key} onClick={() => setActiveVerticalTab(tab.key)}
                className={`w-full flex items-center px-3 py-2 rounded ${activeVerticalTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}> {tab.icon} <span className="ml-2">{tab.label}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 mt-4 text-red-600 hover:bg-red-50 rounded"> <FaLock className="mr-2"/> Logout </button>
          </aside>
          {/* Content */}
          <section className="md:col-span-3 bg-white p-6 rounded-lg shadow space-y-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData,name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={currentUser?.email || ''} readOnly disabled className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData,phone: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                
               
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
              </form>
            )}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-indigo-600" />
                  My Addresses
                </h2>
                <AddressManager 
                  userId={currentUser.id}
                  onAddressChange={() => {
                    setNotification({ show: true, message: 'Addresses updated successfully!', type: 'success' });
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                  }}
                />
              </div>
            )}
            {activeTab === 'enquiry' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BiMessageRounded className="text-indigo-600" />
                  My Enquiries
                </h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : enquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <BiMessageRounded className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Enquiries Yet</h3>
                    <p className="text-gray-500">You haven't made any enquiries yet. Start shopping to send your first enquiry!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <div key={enquiry.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">Enquiry #{enquiry.id.slice(-8)}</h3>
                            <p className="text-sm text-gray-600">{formatDateOnlyIST(enquiry.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              enquiry.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : enquiry.status === 'replied'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {enquiry.status === 'pending' ? 'Pending' : enquiry.status === 'replied' ? 'Replied' : 'Resolved'}
                            </span>
                            {enquiry.replyCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {enquiry.replyCount} {enquiry.replyCount === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>
                        </div>
                        {enquiry.message && (
                          <p className="text-sm text-gray-700 mb-2">{enquiry.message.slice(0, 100)}...</p>
                        )}
                        {enquiry.enquiry_items?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            Items: {enquiry.enquiry_items.length} | 
                            Total: ₹{calculateTotal(enquiry.enquiry_items).toFixed(2)}
                          </div>
                        )}
                        <div className="mt-3">
                          <Link 
                            to="/enquiry-history" 
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                          >
                            <FaEye /> View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link 
                        to="/enquiry-history" 
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <FaClock /> View All Enquiries
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaHeart className="text-red-500" />
                  My Wishlist
                </h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-500">Save items you love to your wishlist and shop them later!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map(item => (
                      <div key={item.wishlist_item_id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative">
                        <button
                          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveFromWishlist(item.wishlist_item_id)}
                          title="Remove from wishlist"
                          disabled={loading}
                        >
                          <MdDelete size={16} />
                        </button>
                        <Link to={`/product/${item.product_id}`} className="block">
                          <div className="aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={item.image || 'https://placehold.co/300x300?text=Product'}
                              alt={item.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300?text=Product'; }}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                            <p className="text-gray-600 text-xs mb-2 line-clamp-2">{item.description?.slice(0, 60) || 'Quality product available at great price'}...</p>
                            <div className="flex items-center justify-between">
                              <div className="text-indigo-600 font-semibold">₹{Number(item.price).toFixed(2)}</div>
                              <span className="text-xs text-blue-600 hover:text-blue-800">View →</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaLock className="text-gray-600" />
                  Security Settings
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
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
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
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
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
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
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
