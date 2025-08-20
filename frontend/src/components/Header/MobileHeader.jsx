import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { MdOutlineShoppingCart } from "react-icons/md";
import { ChevronRight, MapPin, Bell, ShoppingCart, AlignLeft } from "lucide-react";
import { useLocationContext } from "../../contexts/LocationContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    getCartItems,
} from "../../utils/supabaseApi";

const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        right: 3, // Move badge more to the left to avoid covering text
        top: 0, // Adjust top position slightly
        border: `2px solid ${theme.palette.background.paper}`,
        padding: "0 4px",
        backgroundColor: "#ff4081",
        fontSize: "0.7rem",
        minWidth: "16px",
        height: "16px",
    },
}));

const MobileHeader = ({ toggleMobileMenu }) => {
    const { currentUser } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { selectedAddress, setShowModal, setModalMode } = useLocationContext();
    const location = useLocation();
    const navigate = useNavigate();

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
        window.addEventListener("cartUpdated", fetchCart);
        return () => window.removeEventListener("cartUpdated", fetchCart);
    }, [currentUser]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile && location.pathname.startsWith("/subcategories")) return null;

    return (
        <header className="bg-white header-container">
            <div className="flex items-center w-full p-0 shadow-sm h-13 justify-between">
                {/* Hamburger icon */}
                <button className="p-2">
                    <AlignLeft size={24} onClick={toggleMobileMenu} />
                </button>

                {/* Logo */}
                <div className="flex flex-col mr-4">
                    {/* <span className="font-semibold leading-none text-sm">BigBestmart</span>
                    <span className="text-[10px] text-gray-500 leading-none">A2C Junctions</span> */}
                    <img src="https://i.postimg.cc/k4SvL710/BBM-Logo.png" alt="Logo" className="w-30 mt-1" />
                </div>

                {/* Right icons and button */}
                <div className="flex items-center mr-1">
                    <button className="p-2">
                        <Bell size={27} />
                    </button>
                    <Link
                        to="/cart"
                        className="flex items-center  rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                        <div className="relative">
                            <StyledBadge badgeContent={cartCount} color="secondary">
                                <MdOutlineShoppingCart className="w-7 h-7 text-gray-600 group-hover:text-blue-600" />
                            </StyledBadge>
                        </div>
                    </Link>
                    <button
                        onClick={() => { currentUser ? navigate("/MobileAccount") : navigate("/login") }}
                        className="border px-2 w-[90px] rounded text-sm bg-gray-300 border-gray-400 shadow-md hover:shadow-inner transition-shadow"
                        style={{ minHeight: 27 }}
                    >
                        {currentUser ? `Hello ${currentUser.name.split(" ")[0]}!` : "Signin"}
                    </button>

                </div>
            </div>

            {/* Address selector */}
            <button
                className="border-0 rounded-lg flex items-center text-xs text-blue-700 hover:text-blue-700 transition-colors md:mx-0 md:px-4 w-full overflow-hidden whitespace-nowrap md:hidden "
                onClick={() => {
                    setShowModal(true);
                    setModalMode("visibility");
                }}
            >
                <Link className="flex items-center align-middle space-x-1">
                    <MapPin className="size-4 md:size-4 text-black" />
                    <span className="truncate text-xs flex">
                        Select Delivery Address <ChevronRight size={16} />
                        {selectedAddress ? (
                            <span>
                                {selectedAddress.city} {selectedAddress.state}{" "}
                                {selectedAddress.postal_code}
                            </span>
                        ) : null}
                    </span>
                </Link>
            </button>
        </header>
    );
};

export default MobileHeader;



{/* <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/about-us"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/contact-us"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink> */}