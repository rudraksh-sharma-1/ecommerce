import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Categories with routing paths
const categories = [
  {
    label: "Grocery",
    path: "/",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 8V6.8a2.8 2.8 0 0 1 2.8-2.8h6.4A2.8 2.8 0 0 1 18 6.8V8" strokeLinecap="round" />
        <rect x="4" y="8" width="16" height="12" rx="2" strokeLinejoin="round" />
        <path d="M9 8V5M15 8V5" strokeLinecap="round" />
        <circle cx="9" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
      </svg>

    ),
    activeBg: "bg-pink-100",
  },
  {
    label: "Branding",
    path: "/",
    icon: (
      <svg className="!mr-2 lucide lucide-printer-check-icon lucide-printer-check" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5" /><path d="m16 19 2 2 4-4" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2" /><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /></svg>

    ),
    activeBg: "bg-blue-100",
  },
  {
    label: "Fashion",
    path: "/",
    icon: (
      <svg className="!mr-2 lucide lucide-shirt-icon lucide-shirt" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
    ),
    activeBg: "bg-green-100",
  },
  {
    label: "Eatery",
    path: "/",
    icon: (
      <svg className="!mr-2 lucide lucide-utensils-icon lucide-utensils" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
    ),
    activeBg: "bg-yellow-100",
  },
  {
    label: "Plus",
    path: "/",
    icon: (
      <svg className="!mr-2 lucide lucide-shield-plus-icon lucide-shield-plus" xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
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
    <div className="flex overflow-x-auto whitespace-nowrap py-1 hide-scrollbar">
      {categories.map((cat) => {
        const isActive = location.pathname === cat.path;

        return (
          <button
            style={{ minHeight: '20px' }}
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
