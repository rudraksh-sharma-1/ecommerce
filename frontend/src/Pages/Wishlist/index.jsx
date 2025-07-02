import React, { useState, useEffect } from 'react';
import { getWishlistItems, removeFromWishlist } from '../../utils/supabaseApi';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';

const Wishlist = () => {
  const { currentUser } = useAuth();
  const user_id = currentUser?.id;
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      if (!user_id) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      const { wishlistItems, success, error } = await getWishlistItems(user_id);
      setWishlist(success && wishlistItems ? wishlistItems : []);
      setLoading(false);
    }
    fetchWishlist();
  }, [user_id]);

  const handleRemove = async (wishlist_item_id) => {
    setLoading(true);
    await removeFromWishlist(wishlist_item_id);
    const { wishlistItems, success } = await getWishlistItems(user_id);
    setWishlist(success && wishlistItems ? wishlistItems : []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist.length) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">Save your favorite items for later</p>
          </div>
          
          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Discover and save your favorite products to your wishlist!</p>
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <div key={item.wishlist_item_id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
              {/* Remove Button */}
              <div className="relative">
                <button
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => handleRemove(item.wishlist_item_id)}
                  title="Remove from wishlist"
                >
                  <MdDelete size={16} />
                </button>
                
                {/* Product Image */}
                <Link to={`/product/${item.product_id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.image || 'https://placehold.co/300x300?text=Product'}
                      alt={item.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/300x300?text=Product'; 
                      }}
                    />
                  </div>
                </Link>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <Link to={`/product/${item.product_id}`} className="block hover:text-blue-600 transition-colors">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                </Link>
                
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description.slice(0, 80)}...
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-blue-600">
                    ₹{Number(item.price).toFixed(2)}
                  </div>
                  <Link 
                    to={`/product/${item.product_id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Continue Shopping</h3>
            <p className="text-gray-600 mb-6">Discover more amazing products and add them to your wishlist</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </Link>
              <Link 
                to="/productListing" 
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Shop by Category
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
