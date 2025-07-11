import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LiaAngleDownSolid } from "react-icons/lia";
import CategoryPanel from "./CategoryPanel";
import "./style.css";
import { getAllCategories } from "../../utils/supabaseApi";

const Navigation = () => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openCategoryPanel = () => {
    setIsOpenCatPanel(true);
  };

  const closeCategoryPanel = () => {
    setIsOpenCatPanel(false);
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // State for categories
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setCatLoading(true);
      const { success, categories: catList } = await getAllCategories();
      if (success && Array.isArray(catList)) {
        setCategories(catList.filter((cat) => cat.active));
      } else {
        setCategories([]);
      }
      setCatLoading(false);
    }
    fetchCategories();
  }, []);

  // Navigation items with submenu data
  const navItems = [
    { text: "Home", link: "/", hasSubmenu: false },
    /* {
      text: "Stationery",
      link: "/productListing",
      hasSubmenu: true,
      submenu: categories.map((cat) => ({
        text: cat.name,
        link: `/productListing?category=${encodeURIComponent(cat.name)}`,
      })),
    }, */
    /* { text: "Custom Printing", link: "/custom-printing", hasSubmenu: false }, */
    // { text: "Blog", link: "/blog", hasSubmenu: false },
    { text: "About Us", link: "/about-us", hasSubmenu: false },
    { text: "Contact Us", link: "/contact-us", hasSubmenu: false },
  ];

  return (
    <div className="navigation-container">
      <ul className="flex items-center gap-1 navigation-menu">
        {navItems.map((item, index) => (
          <li
            key={index}
            className="list-none relative"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <Link to={item.link} className="block">
              <div className="nav-item text-gray-800 hover:text-blue-600 transition-colors text-sm px-3 h-full flex items-center whitespace-nowrap">
                {item.text}
                {/* Only show dropdown icon if not Stationery main link */}
                {item.hasSubmenu && item.text !== 'Stationery' && (
                  <LiaAngleDownSolid className="ml-1 text-xs" />
                )}
              </div>
            </Link>

            {item.hasSubmenu && hoveredIndex === index && (
              <div className="submenu absolute top-full left-0 z-20 min-w-[200px] bg-white shadow-lg rounded-md overflow-hidden">
                <ul>
                  {item.submenu.map((subItem, subIndex) => (
                    <li key={subIndex} className="list-none w-full">
                      <Link to={subItem.link} className="w-full">
                        <div className="text-gray-700 w-full text-left justify-start rounded-none hover:bg-gray-100 px-4 py-3 text-sm">
                          {subItem.text}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {isOpenCatPanel && (
        <CategoryPanel isOpen={isOpenCatPanel} onClose={closeCategoryPanel} />
      )}
    </div>
  );
};

export default Navigation;
