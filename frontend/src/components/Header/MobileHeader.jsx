import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Bell, ShoppingCart, AlignLeft } from "lucide-react";
import { useLocationContext } from "../../contexts/LocationContext";
import { useLocation } from "react-router-dom";

const MobileHeader = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { selectedAddress, setShowModal, setModalMode } = useLocationContext();
    const location = useLocation();
    const navigate = useNavigate();

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
                    <AlignLeft size={24} />
                </button>

                {/* Logo */}
                <div className="flex flex-col ml-2">
                    {/* <span className="font-semibold leading-none text-sm">BigBestmart</span>
                    <span className="text-[10px] text-gray-500 leading-none">A2C Junctions</span> */}
                    <img src="https://i.postimg.cc/kDP71vDP/Big-Best-Mart-Logo.jpg" alt="Logo" className="w-10"/>
                </div>

                {/* Right icons and button */}
                <div className="flex items-center mr-1">
                    <button className="p-2">
                        <Bell size={22} />
                    </button>
                    <button
                        onClick={() => navigate("/cart")}
                        className="p-2 !m-0">
                        <ShoppingCart size={22} />
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="border px-2 w-[75px] rounded text-sm bg-gray-300 border-gray-400 shadow-md hover:shadow-inner transition-shadow"
                        style={{ minHeight: 27 }}
                    >
                        Sign in
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