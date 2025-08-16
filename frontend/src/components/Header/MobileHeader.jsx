// import React, { useState, useEffect, useRef } from "react";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import {ChevronRight, MapPin,Menu,X,Home,ShoppingCart,User,UserPlus,Mail,Bell,Search,Heart, icons} from 'lucide-react'
// import { useLocationContext } from "../../contexts/LocationContext";
// import { useLocation } from 'react-router-dom';
// const MobileHeader = () => {
//     const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//     const[isMenuOpen,setisMenuOpen]=useState(false);
//     const {selectedAddress,setShowModal,setModalMode} = useLocationContext();
//     const location = useLocation();
//     const getSetting =(key,defaultValue)=>{
//         const settings={
//             company_name:"BigBestMart"
//         };
//         return settings[key] ||defaultValue;
//     };
//     useEffect(() => {
//         const handleResize = () => {
//           setIsMobile(window.innerWidth <= 768);
//         };
    
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//       }, []);
//      useEffect(()=>{
//         setisMenuOpen(false);
//      },[location.pathname]);
//      if(isMobile && location.pathname.startsWith("/subcategories"))return null;
     
//      const toggleMenu=()=>{
//         setisMenuOpen(!isMenuOpen);
//      };
//      const handleAddressClick=()=>{
//         setShowModal(true);
//         setModalMode("visibility");
//      };
//      const navigationItems=[
//         {path:"/",label:"Home",icon:Home},
//         {path:"/cart",label:"Cart",icon:ShoppingCart},
//         {path:"/login",label:"Login",icon:User},
//         {path:"/signup",label:"Signup",icon:UserPlus},
//         {path:"/contact",label:"Contact",icon:Mail},
//         {path:"/notifications",label:"Notifications",icon:Bell},
//      ];
//     return (
//         <header className="bg-white header-container sticky top-0 z-50 shadow-sm">
//             <div className="flex items-center w-full px-4 py-3 justify-between">
//                 {/*Mobile menu button and Logo with Company Name added here*/}
//                 <NavLink
//                      to="/"
//                     onClick={toggleMenu}
//                     className="md:hidden p-1"
//                     aria-label="Toggle Menu"
//                 ><Menu className="w-6 h-6 text-gray-700"/>
//                 </NavLink>
//                 <div className="flex-1 flex justify-center">
//                 <NavLink
//                     to="/"
//                     className="flex flex-col items-center">
//                     <div className="text-lg font-bold text-gray-800">
//                         {getSetting("company_name","BigBestMart")}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                         A2C Juctions
//                     </div> 
//                 </NavLink>
//                 </div>
//                 {/*Right Icons added here8*/}
//                 <div className="flex items-center space-x-2">
//                     {/* Notification Bell */}
//                     <button className="w-5 h-5 text-gray-700">
//                          <Bell className="w-5 h-5 text-gray-700"/>
//                     </button>
//                 <NavLink
//                     to="/cart"
//                     className="p-2">
//                     <ShoppingCart className="w-5 h-5 text-gray-700"/>
//                 </NavLink>
//                 {/* Sign In Button */}
//                  <NavLink
//                     to="/login"
//                     className="px-3 py-1 border-gray-300 rounded text-sm text-gray-700">
//                     Sign In
//                 </NavLink>
//                 </div>
//                 </div>
//                 {/* Address button */}

//                 {/* <button className="w-full px-4 py-2 bg-gray-50 border-gray-200 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
//                 onClick={handleAddressClick}>
//                     <div className="flex item-center space-x-2 min-w-0 flex-1">
//                         <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0"/>
//                         <span className="text-sm text-gray-600 truncate">
//                             {selectedAddress?`${selectedAddress.city},${selectedAddress.state} ${selectedAddress.postal_code}`:"Select Delivery Address"}
//                         </span>
//                     </div>
//                 </button> */}
//                 <button
//                 className="border-0 rounded-lg flex items-center text-xs text-blue-700 hover:text-blue-700 transition-colors  
//            md:mx-0 md:px-4 w-full overflow-hidden whitespace-nowrap md:hidden "
//                 onClick={() => { setShowModal(true), setModalMode("visibility") }}
//             >
//                 <Link className="flex items-center align-middle space-x-1">
//                     <MapPin className="size-4 md:size-4 text-black" />
//                     <span className="truncate text-xs flex">
//                         Select Delivery Address <ChevronRight size={16} />
//                         {selectedAddress ? <span>{selectedAddress.city} {selectedAddress.state} {selectedAddress.postal_code}</span> : <></>}
//                     </span>
//                 </Link>
//             </button>
//               {/* Search Bar
//               <div className="px-4 py-2 bg-white border-b border-gray-100">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform-translate-y-1/2 w-4 h-4 text-gray-400"/>
//                 <input type="text" placeholder="Search for products..." className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

//               </div>
//               </div> */}
//                  {/* Category Buttons */}
//               <div className="px-4 py-2 bg-white border-b border-gray-200">
//                 <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
//                     <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full whitespace-nowrap text-sm">
//                         <Heart className="w-4 h-4"/>
//                         <span>Office</span>
//                     </button>
//                     <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full whitespace-nowrap text-sm">
//                         <span> ⭐ Branding</span>
//                     </button>
//                     <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full whitespace-nowrap text-sm">
//                         <span>👤 Fashion</span>
//                     </button>
//                     <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full whitespace-nowrap text-sm">
//                         <span>Category</span>
//                     </button>
//                 </div>
//               </div>
              
//               </header>

             
             
//     );
// };
            
            




// export default MobileHeader;
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Menu, X, Home, ShoppingCart, User, UserPlus, Mail, Bell, Search, Heart } from 'lucide-react'
import { useLocationContext } from "../../contexts/LocationContext";
import { useLocation } from 'react-router-dom'

const MobileHeader = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const { selectedAddress, setShowModal, setModalMode } = useLocationContext();
    const location = useLocation();

    const getSetting = (key, defaultValue) => {
        const settings = {
            company_name: "BigBestMart"
        };
        return settings[key] || defaultValue;
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    if (isMobile && location.pathname.startsWith("/subcategories")) return null;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleAddressClick = () => {
        setShowModal(true);
        setModalMode("visibility");
    };

    const navigationItems = [
        { path: "/", label: "Home", icon: Home },
        { path: "/cart", label: "Cart", icon: ShoppingCart },
        { path: "/contact-us", label: "Contact Us", icon: Mail },
    ];

    const categories = [
        { name: "Office", icon: "💼" },
        { name: "Branding", icon: "⭐" },
        { name: "Fashion", icon: "👤" },
        { name: "Electrical", icon: "⚡" },
        { name: "Groceries", icon: "🛒" },
        { name: "Electronics", icon: "📱" },
        { name: "Beauty", icon: "💄" },
        { name: "Sports", icon: "⚽" },
    ];

    return (
        <>
            <header className="bg-white header-container sticky top-0 z-[100] shadow-sm">
                {/* Main Header Row */}
                <div className="flex items-center w-full px-4 py-3 justify-between border-b border-gray-100">
                    {/* Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="p-1"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>

                    {/* Logo and Company Name */}
                    <div className="flex-1 flex justify-center">
                        <NavLink to="/" className="flex flex-col items-center">
                            <div className="text-lg font-bold text-gray-800">
                                {getSetting("company_name", "BigBestMart")}
                            </div>
                            <div className="text-xs text-gray-500">
                                A2C Junctions
                            </div>
                        </NavLink>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-2">
                        {/* Notification Bell */}
                        <NavLink to="/notifications" className="p-1.5">
                            <Bell className="w-5 h-5 text-gray-700" />
                        </NavLink>
                        
                        {/* Cart Icon */}
                        <NavLink to="/cart" className="p-1.5">
                            <ShoppingCart className="w-5 h-5 text-gray-700" />
                        </NavLink>
                        
                        {/* Sign In Button */}
                        <NavLink
                            to="/login"
                            className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Sign In
                        </NavLink>
                    </div>
                </div>

                {/* Location Selection Bar */}
                <button
                    className="w-full px-4 py-2.5 bg-white flex items-center text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                    onClick={handleAddressClick}
                >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="truncate text-xs flex">
                      Select Delivery Address <ChevronRight size={16} />                      
                       {selectedAddress ? <span>{selectedAddress.city} {selectedAddress.state} {selectedAddress.postal_code}</span> : <></>}
                  </span>
                    </div>
                </button>


                {/* Category Filter Tags */}
                <div className="px-4 py-3 bg-white border-b border-gray-200">
                    <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button key={category.id} className="px-1 py-1.5 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                                <span className="text-gray-700">{category.icon}{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50" onClick={toggleMenu}>
                    <div 
                        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Menu Header with Search */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {getSetting("company_name", "BigBestMart")}
                                </h2>
                                <button
                                    onClick={toggleMenu}
                                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            
                            {/* Search Bar in Menu */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-1 overflow-y-auto">
                            <div className="py-2">
                                {/* Categories Dropdown */}
                                <div>
                                    <button
                                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                        className="flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Menu className="w-5 h-5 mr-4" />
                                            <span className="font-medium">Categories</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-90' : ''}`} />
                                    </button>
                                    
                                    {isCategoriesOpen && (
                                        <div className="bg-gray-50 border-t border-b border-gray-200">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.name}
                                                    className="flex items-center w-full px-12 py-3 text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <span className="mr-3 text-base">{category.icon}</span>
                                                    <span>{category.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Items */}
                                {navigationItems.map(({ path, label, icon: IconComponent }) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        className={({ isActive }) =>
                                            `flex items-center px-6 py-4 text-gray-700 hover:bg-gray-100 transition-colors ${
                                                isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : ""
                                            }`
                                        }
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <IconComponent className="w-5 h-5 mr-4" />
                                        <span className="font-medium">{label}</span>
                                    </NavLink>
                                ))}

                                {/* Address Section */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="px-6 mb-3">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                            Delivery
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleAddressClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center px-6 py-3 w-full text-left text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <MapPin className="w-5 h-5 mr-4 text-blue-600" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">Change Address</div>
                                            {selectedAddress && (
                                                <div className="text-sm text-gray-500 truncate">
                                                    {selectedAddress.city}, {selectedAddress.state}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </nav>

                        {/* Bottom Login Section */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex space-x-3">
                                <NavLink
                                    to="/login"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileHeader;