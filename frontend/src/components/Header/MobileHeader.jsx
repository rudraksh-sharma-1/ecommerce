import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {ChevronRight, MapPin} from 'lucide-react'
import { useLocationContext } from "../../contexts/LocationContext";
import { useLocation } from 'react-router-dom'
const MobileHeader = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const {selectedAddress,setShowModal,setModalMode} = useLocationContext();
    const location = useLocation();
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
            <div className="flex items-center w-full p-0 align-middle shadow-sm !h-13 justify-between">
                <NavLink
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
                </NavLink>
            
            </div>
            <button
                className="border-0 rounded-lg flex items-center text-xs text-blue-700 hover:text-blue-700 transition-colors  
           md:mx-0 md:px-4 w-full overflow-hidden whitespace-nowrap md:hidden "
                onClick={() => { setShowModal(true), setModalMode("visibility") }}
            >
                <Link className="flex items-center align-middle space-x-1">
                    <MapPin className="size-4 md:size-4 text-black" />
                    <span className="truncate text-xs flex">
                        Select Delivery Address <ChevronRight size={16} />
                        {selectedAddress ? <span>{selectedAddress.city} {selectedAddress.state} {selectedAddress.postal_code}</span> : <></>}
                    </span>
                </Link>
            </button>
        </header>
    )
}

export default MobileHeader
