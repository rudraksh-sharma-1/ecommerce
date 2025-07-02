import React, { useState, useEffect } from 'react';
import { getCartItems, updateCartItem, removeCartItem, clearCart, createEnquiry } from '../../utils/supabaseApi';
import { Link } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import './cart.css';

const Cart = () => {
  const { currentUser } = useAuth();
  const user_id = currentUser?.id;
  const user_name = currentUser?.name || currentUser?.email || '';
  const user_email = currentUser?.email || '';
  const user_phone = currentUser?.user_metadata?.phone || ''
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiryStatus, setEnquiryStatus] = useState(null); // success | error | null
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Fetch cart items from Supabase on mount
  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      const { success, cartItems, error } = await getCartItems(user_id);
      setCartItems(success && cartItems ? cartItems : []);
      setLoading(false);
    }
    fetchCart();
  }, [user_id]);


  // Function to update item quantity
  const updateQuantity = async (cart_item_id, newQuantity) => {
    if (newQuantity < 1) return;
    setLoading(true);
    await updateCartItem(cart_item_id, newQuantity);
    // Refresh cart
    const { success, cartItems } = await getCartItems(user_id);
    setCartItems(success && cartItems ? cartItems : []);
    // Trigger cart updated event
    window.dispatchEvent(new Event('cartUpdated'));
    setLoading(false);
  };

  // Function to remove item from cart
  const removeItem = async (cart_item_id) => {
    setLoading(true);
    await removeCartItem(cart_item_id);
    const { success, cartItems } = await getCartItems(user_id);
    setCartItems(success && cartItems ? cartItems : []);
    // Trigger cart updated event
    window.dispatchEvent(new Event('cartUpdated'));
    setLoading(false);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  
  // Shipping cost - could be dynamic based on location or free above certain amount
  const shippingCost = subtotal > 1000 ? 0 : 50;
  
  // Grand total
  const grandTotal = subtotal + shippingCost;

  const handleClearCart = async () => {
    setLoading(true);
    await clearCart(user_id);
    setCartItems([]);
    setLoading(false);
  };

  const handleSendEnquiry = async () => {
    setEnquiryLoading(true);
    setEnquiryStatus(null);
    const { success, error } = await createEnquiry({
      user_id,
      name: user_name,
      email: user_email,
      phone: user_phone,
      message: '', // Optionally add a message field
      cartItems
    });
    if (success) {
      setEnquiryStatus('success');
      await clearCart(user_id);
      setCartItems([]);
    } else {
      setEnquiryStatus('error');
    }
    setEnquiryLoading(false);
  };

  if (loading) {
    return <div className="container px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 py-8 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-10 md:py-16">
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              to="/" 
              className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition duration-200"
              style={{ backgroundColor: '#3f51b5' }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b p-4">
                  <h2 className="text-lg md:text-xl font-semibold">Shopping Cart ({cartItems.length} items)</h2>
                </div>
                
                <div className="divide-y">
                  {cartItems.map(item => (
                    <div key={item.cart_item_id} className="p-3 sm:p-4 cart-item">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        {/* Mobile: Image and Details Row */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="cart-product-image flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/200x200/f0f0f0/666?text=${encodeURIComponent(item.name.charAt(0))}`;
                              }}
                            />
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 product-name text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-600 mb-1">Category: {item.category}</p>
                            {item.customization && (
                              <p className="text-xs text-gray-600 mb-1 line-clamp-1">Customization: {item.customization}</p>
                            )}
                            <p className="text-sm font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {/* Mobile: Quantity and Total Row */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value);
                                if (newQty > 0) updateQuantity(item.cart_item_id, newQty);
                              }}
                              className="w-12 h-8 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-blue-500"
                            />
                            <button 
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-gray-900 mb-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <button 
                              onClick={() => removeItem(item.cart_item_id)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm transition-colors"
                            >
                              <MdDelete size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-start sm:items-center gap-4">
                        {/* Product Image */}
                        <div className="cart-product-image flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://placehold.co/200x200/f0f0f0/666?text=${encodeURIComponent(item.name.charAt(0))}`;
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-grow text-left min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 product-name">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">Category: {item.category}</p>
                          {item.customization && (
                            <p className="text-sm text-gray-600 mb-1 line-clamp-1">Customization: {item.customization}</p>
                          )}
                          <p className="text-sm font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value);
                              if (newQty > 0) updateQuantity(item.cart_item_id, newQty);
                            }}
                            className="w-12 h-8 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Item Total & Remove Button */}
                        <div className="text-right min-w-[100px]">
                          <p className="font-medium text-gray-900 mb-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <button 
                            onClick={() => removeItem(item.cart_item_id)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm ml-auto transition-colors"
                          >
                            <MdDelete size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t p-4 flex flex-col sm:flex-row justify-between gap-4">
                  <Link 
                    to="/" 
                    className="text-primary hover:underline flex items-center justify-center sm:justify-start gap-1 w-full sm:w-auto"
                    style={{ color: '#3f51b5' }}
                  >
                    ← Continue Shopping
                  </Link>
                  
                  <button 
                    onClick={handleClearCart} 
                    className="text-red-500 hover:text-red-700 flex items-center justify-center sm:justify-start gap-1 w-full sm:w-auto"
                  >
                    <MdDelete size={16} />
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3 mt-6 lg:mt-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Including GST</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleSendEnquiry}
                    disabled={enquiryLoading || cartItems.length === 0}
                    className={`block w-full bg-primary text-white text-center py-3 px-4 rounded-md hover:bg-primary-dark transition duration-200 ${enquiryLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: '#3f51b5' }}
                  >
                    {enquiryLoading ? 'Sending Enquiry...' : 'Send Enquiry to Admin'}
                  </button>
                  {enquiryStatus === 'success' && (
                    <div className="text-green-600 text-center mt-2">Enquiry sent successfully!</div>
                  )}
                  {enquiryStatus === 'error' && (
                    <div className="text-red-600 text-center mt-2">Failed to send enquiry. Please try again.</div>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Secure Checkout</span>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">We Accept:</p>
                  <div className="flex gap-2 flex-wrap">
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
