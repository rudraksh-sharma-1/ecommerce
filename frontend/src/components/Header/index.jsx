import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Search from '../Search'; 
import Navigation from '../Navigation'; 
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import {MdOutlineShoppingCart} from 'react-icons/md';
import {IoGitCompareOutline} from 'react-icons/io5';
import {FaRegHeart} from 'react-icons/fa6';
import {GiHamburgerMenu} from 'react-icons/gi';
import {FaRegUser} from 'react-icons/fa';
import {FiLogOut, FiSearch} from 'react-icons/fi';
import {BiMessageRounded} from 'react-icons/bi'; // Add enquiry icon
import Tooltip from '@mui/material/Tooltip';

import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { usePromotional } from '../../contexts/PromotionalContext.jsx';
import { getWishlistItems, getCartItems, getUnreadEnquiryCount } from '../../utils/supabaseApi';
import './header.css';

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: 3,  // Move badge more to the left to avoid covering text
      top: 0,    // Adjust top position slightly
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
      backgroundColor: '#ff4081',
      fontSize: '0.7rem',
      minWidth: '16px',
      height: '16px',
    },
}));

// Custom styled icon button with better touch targets
const StyledIconButton = styled(IconButton)(({ theme }) => ({
    padding: '8px',
    '@media (max-width: 767px)': {
        padding: '6px',
        margin: '0 1px',
    },
    '& svg': {
        fontSize: '1.3rem',
        '@media (max-width: 767px)': {
            fontSize: '1.2rem',
        },
    },
}));

const Header = () => {
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [enquiryCount, setEnquiryCount] = useState(0); // Add enquiry count state
    const { currentUser, logout } = useAuth();
    const { getSetting } = useSettings();
    const { getPromoSetting } = usePromotional();
    const navigate = useNavigate();
    const userDropdownRef = useRef(null);

    // Close user dropdown when clicking outside
    useEffect(() => {
        if (!userDropdownOpen) return;
        function handleClickOutside(event) {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userDropdownOpen]);

    useEffect(() => {
        async function fetchWishlist() {
            if (currentUser && currentUser.id) {
                const { success, wishlistItems } = await getWishlistItems(currentUser.id);
                setWishlistCount(success && wishlistItems ? wishlistItems.length : 0);
            } else {
                setWishlistCount(0);
            }
        }
        fetchWishlist();
        // Listen for wishlist updates
        window.addEventListener('wishlistUpdated', fetchWishlist);
        return () => window.removeEventListener('wishlistUpdated', fetchWishlist);
    }, [currentUser]);

    useEffect(() => {
        async function fetchCart() {
            if (!currentUser) {
                setCartCount(0);
                return;
            }
            const { success, cartItems } = await getCartItems(currentUser.id);
            if (success && cartItems) {
                const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(total);
            } else {
                setCartCount(0);
            }
        }
        fetchCart();
        // Listen for cart updates
        window.addEventListener('cartUpdated', fetchCart);
        return () => window.removeEventListener('cartUpdated', fetchCart);
    }, [currentUser]);

    // Fetch enquiry count
    useEffect(() => {
        async function fetchEnquiryCount() {
            if (!currentUser) {
                setEnquiryCount(0);
                return;
            }
            const { success, count } = await getUnreadEnquiryCount(currentUser.id);
            if (success) {
                setEnquiryCount(count);
            } else {
                setEnquiryCount(0);
            }
        }
        fetchEnquiryCount();
        // Listen for enquiry updates
        window.addEventListener('enquiryUpdated', fetchEnquiryCount);
        return () => window.removeEventListener('enquiryUpdated', fetchEnquiryCount);
    }, [currentUser]);



    // Check for announcement bar and update body classes
    useEffect(() => {
        // Check if announcement bar is active
        const announcementBarActive = getPromoSetting('announcement_bar_active', false);
        
        // Add or remove classes from body for spacing adjustment
        if (announcementBarActive) {
            document.body.classList.add('has-announcement-bar');
        } else {
            document.body.classList.remove('has-announcement-bar');
        }
        
        return () => {
            document.body.classList.remove('has-announcement-bar');
        };
    }, [getPromoSetting]);

    // Check for window resize to determine mobile view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) {
                setSearchExpanded(false);
            }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const announcementBarActive = getPromoSetting('announcement_bar_active', false);
    const [announcementBarVisible, setAnnouncementBarVisible] = useState(false);
    
    // Listen for announcement bar visibility changes
    useEffect(() => {
        const handleVisibilityChange = (event) => {
            const isVisible = event.detail.visible;
            setAnnouncementBarVisible(isVisible);
            
            // Update body class for proper spacing
            if (isVisible) {
                document.body.classList.add('has-announcement-bar');
            } else {
                document.body.classList.remove('has-announcement-bar');
            }
        };

        window.addEventListener('announcementBarVisibilityChange', handleVisibilityChange);
        
        // Initial check - dispatch a check request to announcement bar
        // This handles the case where header loads after announcement bar
        setTimeout(() => {
            const announcementBarElement = document.querySelector('.announcement-bar');
            if (announcementBarElement) {
                setAnnouncementBarVisible(true);
                document.body.classList.add('has-announcement-bar');
            } else {
                setAnnouncementBarVisible(false);
                document.body.classList.remove('has-announcement-bar');
            }
        }, 100);
        
        // Cleanup
        return () => {
            window.removeEventListener('announcementBarVisibilityChange', handleVisibilityChange);
            document.body.classList.remove('has-announcement-bar');
        };
    }, []);

    return (
        <header className={`bg-white header-container ${announcementBarVisible ? 'with-announcement-bar' : ''}`}>
            <div className="header-main border-b border-gray-200 shadow-sm">
                <div className="container mx-auto">
                    <div className="flex items-center h-16 justify-between">
                        {/* Logo section */}
                        <div className="flex-shrink-1 mr-4 logo-container">
                            <Link to={"/"} className="block logo">
                                <img 
                                    src={getSetting('site_logo', '/logo.png')} 
                                    alt={`${getSetting('company_name', 'BBMart')} Logo`} 
                                    className="h-8 w-auto"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/160x40?text=' + getSetting('company_name', 'BBMart');
                                    }}
                                />
                            </Link>
                        </div>

                        {/* Navigation - desktop only */}
                        <div className="hidden md:block flex-shrink-1 ">
                            <Navigation />
                        </div>
                        
                        {/* Business Partner Button */}
                        <Link to={'/BusinessPartner'} className='hidden md:block text-center rounded text-black hover:text-blue-700 transition-colors'>
                            Business Partner
                        </Link>

                        {/* Search Bar - desktop only */}
                        <div className="hidden md:block w-[250px] flex-shrink-0 ml-4">
                            <Search />
                        </div>

                        {/* Action Icons */}
                        <div className="flex flex-shrink-3 items-center ml-auto md:ml-4 space-x-1">
                            {/* MOBILE ICONS: Only show wishlist, cart, and account icons on mobile */}
                            <div className="flex md:hidden items-center space-x-1">
                                {/* Wishlist */}
                                <Link to="/wishlist" className="p-2 text-gray-600 hover:text-blue-600">
                                    <StyledBadge badgeContent={wishlistCount} color="secondary">
                                        <FaRegHeart className="w-5 h-5" />
                                    </StyledBadge>
                                </Link>
                                {/* Cart */}
                                <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600">
                                    <StyledBadge badgeContent={cartCount} color="secondary">
                                        <MdOutlineShoppingCart className="w-5 h-5" />
                                    </StyledBadge>
                                </Link>
                                {/* Account */}
                                {currentUser ? (
                                    <Link to="/MobileAccount" className="p-2 text-gray-600 hover:text-blue-600">
                                        <FaRegUser className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <Link to="/login" className="p-2 text-gray-600 hover:text-blue-600">
                                        <FaRegUser className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>

                            {/* Desktop Elements */}
                            {/* Enquiry History Icon - Only show for logged in users */}
                            

                            <div className="hidden md:flex">
                                <Link to="/cart" className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group">
                                    <div className="relative">
                                        <StyledBadge badgeContent={cartCount} color="secondary">
                                            <MdOutlineShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                        </StyledBadge>
                                    </div>
                                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Cart</span>
                                </Link>
                            </div>

                            <div className="hidden md:block">
                                <Link to="/wishlist" className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group">
                                    <div className="relative">
                                        <StyledBadge badgeContent={wishlistCount} color="secondary">
                                            <FaRegHeart className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                        </StyledBadge>
                                    </div>
                                    <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Wishlist</span>
                                </Link>
                            </div>

                            {/* User account section - desktop only */}
                            <div className="hidden md:block ml-2 relative">
                                {currentUser ? (
                                    <div>
                                        <button 
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            <FaRegUser className="mr-1" />
                                            <span>Hello {currentUser.name || currentUser.user_metadata?.name || currentUser.email || 'User'}!</span>
                                        </button>
                                        
                                        {userDropdownOpen && (
                                            <div 
                                                ref={userDropdownRef}
                                                className="user-dropdown-menu absolute left-0 top-full mt-2 w-48 z-50 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                            >
                                                <Link
                                                    to="/account"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/coming-soon?feature=orders"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    My Orders
                                                </Link>
                                                <Link
                                                    to="/coming-soon?feature=wallet"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    Wallet
                                                </Link>
                                                <Link
                                                    to="/enquiry-history"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    Enquiries
                                                </Link>
                                                <Link
                                                    to="/contact-us"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    Contact Us
                                                </Link>
                                                <Link
                                                    to="/enquiry-history"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    Chat
                                                </Link>
                                                <Link
                                                    to="/cart"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    Cart
                                                </Link>
                                                <hr className="my-1 border-gray-200" />
                                                <button
                                                    onClick={async () => {
                                                        await logout();
                                                        setUserDropdownOpen(false);
                                                        navigate('/');
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <Link to="/login" className="text-sm text-gray-700 hover:text-blue-600 transition-colors mr-1">Login</Link> | 
                                        <Link to="/signup" className="text-sm text-gray-700 hover:text-blue-600 transition-colors ml-1">Register</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay - removed from mobile header */}
        </header>
    )   
}

export default Header;