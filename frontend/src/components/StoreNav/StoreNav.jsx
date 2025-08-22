import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Categories with routing paths
const categories = [
  {
    label: "Office",
    path: "/contact-us",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 21C12 21 5 13.45 5 8.5C5 5.42 7.42 3 10.5 3C12.09 3 13.58 3.81 14.35 5.08C15.12 3.81 16.61 3 18.2 3C21.28 3 23.7 5.42 23.7 8.5C23.7 13.45 17 21 17 21H12Z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    activeBg: "bg-pink-100",
  },
  {
    label: "Branding",
    path: "/BusinessPartner",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
    activeBg: "bg-blue-100",
  },
  {
    label: "Essential",
    path: "/cart",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
        <line x1="9" y1="15" x2="13" y2="15" />
      </svg>
    ),
    activeBg: "bg-green-100",
  },
  {
    label: "Fashion",
    path: "/about-us",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
        <line x1="9" y1="15" x2="13" y2="15" />
      </svg>
    ),
    activeBg: "bg-yellow-100",
  },
];

export default function StoreNav({ onClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="flex overflow-x-auto whitespace-nowrap gap-3 py-1 hide-scrollbar">
      {categories.map((cat) => {
        const isActive = location.pathname === cat.path;

        return (
          <button
            key={cat.label}
            className={`flex items-center min-w-[120px] max-w-[160px] px-3 py-2 rounded-lg font-medium shadow-sm transition-colors shrink-0
              ${isActive ? cat.activeBg : "bg-gray-200"}
              ${isActive ? "" : "hover:bg-gray-300"}
            `}
            onClick={() => {
              navigate(cat.path);
              if (onClick) onClick(cat.label);
            }}
          >
            {cat.icon}
            <span className="truncate">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
