import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdSearch } from "react-icons/md";
import { MapPinned } from "lucide-react";
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import {
  getAllCategories,
  getAllSubcategories,
  getAllGroups,
} from "../../utils/supabaseApi";
import "./style.css";

const CategoriesMenu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);
  const [menuPortalTarget, setMenuPortalTarget] = useState(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { useCurrentLocation, currentLocationAddress } = useLocationContext();

  // Add state for expanded categories and subcategories
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState([]);
  const [isShopByCategoryExpanded, setIsShopByCategoryExpanded] =
    useState(false);

  useEffect(() => {
    fetchCategoriesAndSubcategories();

    // Create portal target or use body
    setMenuPortalTarget(document.body);

    // Check if announcement bar exists
    const checkAnnouncementBar = () => {
      const announcementBar = document.querySelector(".announcement-bar");
      const hasAnnouncement =
        announcementBar && announcementBar.offsetHeight > 0;
      setHasAnnouncementBar(hasAnnouncement);
    };

    checkAnnouncementBar();

    // Also check when the component mounts and on resize
    window.addEventListener("resize", checkAnnouncementBar);

    return () => {
      window.removeEventListener("resize", checkAnnouncementBar);
    };
  }, []);

  const handleSidebarLocationClick = async () => {
    try {
      await useCurrentLocation();
      alert("Location updated successfully!");
    } catch (error) {
      console.error("Sidebar location error:", error);
      alert("Failed to get your current location.");
    }
  };

  const fetchCategoriesAndSubcategories = async () => {
    setLoading(true);
    try {
      const [categoriesResult, subcategoriesResult, groupsResult] =
        await Promise.all([
          getAllCategories(),
          getAllSubcategories(),
          getAllGroups(),
        ]);

      if (categoriesResult.success && categoriesResult.categories) {
        setCategories(categoriesResult.categories.filter((cat) => cat.active));
      }

      if (subcategoriesResult.success && subcategoriesResult.subcategories) {
        setSubcategories(
          subcategoriesResult.subcategories.filter((sub) => sub.active)
        );
      }

      if (groupsResult.success && groupsResult.groups) {
        setGroups(groupsResult.groups.filter((group) => group.active));
      }
    } catch (error) {
      console.error(
        "Error fetching categories, subcategories, and groups:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter((sub) => sub.category_id === categoryId);
  };

  const getGroupsForSubcategory = (subcategoryId) => {
    return groups.filter((group) => group.subcategory_id === subcategoryId);
  };

  const toggleMenu = () => {
    const newIsOpen = !isMenuOpen;
    setIsMenuOpen(newIsOpen);

    // Prevent body scroll when menu is open
    if (newIsOpen) {
      document.body.classList.add("categories-menu-open");
    } else {
      document.body.classList.remove("categories-menu-open");
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove("categories-menu-open");
  };

  // Toggle expand/collapse for a category
  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle expand/collapse for a subcategory
  const toggleSubcategoryExpand = (subcategoryId) => {
    setExpandedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  // Search handler
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOverlayOpen(false);
      setSearchQuery("");
      closeMenu();
      navigate(
        `/productListing?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const handleSearchClick = () => {
    setSearchOverlayOpen(true);
    closeMenu();
    setTimeout(() => {
      const input = document.querySelector(
        '.desktop-search-overlay input[type="search"], .desktop-search-overlay input[type="text"]'
      );
      if (input) input.focus();
    }, 100);
  };

  // Cleanup effect to remove body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("categories-menu-open");
    };
  }, []);

  if (loading) {
    return (
      <div className="categories-menu-container">
        <div className="categories-menu-header">
          <button className="menu-toggle-btn" disabled>
            <FaBars />
            <span>Loading Categories...</span>
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Menu Toggle Button - stays in place */}
      <div className="categories-menu-container">
        <div className="categories-menu-header">
          <button className="menu-toggle-btn" onClick={toggleMenu}>
            <FaBars />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Menu Overlay and Panel - rendered via portal to escape stacking context */}
      {menuPortalTarget &&
        createPortal(
          <>
            {/* Overlay */}
            {isMenuOpen && (
              <div
                className={`categories-menu-overlay ${
                  hasAnnouncementBar ? "with-announcement" : ""
                }`}
                onClick={closeMenu}
              />
            )}

            {/* Slide-out Menu */}
            <div
              className={`categories-menu-panel ${isMenuOpen ? "open" : ""} ${
                hasAnnouncementBar ? "with-announcement" : ""
              }`}
            >
              <div className="categories-menu-content">
                {/* Header */}
                <div className="categories-menu-panel-header">
                  <h2>Menu</h2>
                  <button className="close-btn" onClick={closeMenu}>
                    <FaTimes />
                  </button>
                </div>

                {/* Categories List - Amazon style layout */}
                <div className="categories-list">
                  {/* Search */}
                  <div className="menu-section">
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <form
                        onSubmit={handleSearchSubmit}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#ffffff",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <MdSearch
                          size={18}
                          style={{
                            color: "#666",
                            flexShrink: 0,
                            marginRight: "8px",
                          }}
                        />
                        <input
                          type="search"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            fontSize: "16px",
                            flex: "1",
                            minWidth: "0",
                            color: "#333",
                            paddingRight: searchQuery ? "8px" : "0",
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearchSubmit();
                              closeMenu();
                            }
                          }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#666",
                              cursor: "pointer",
                              padding: "4px",
                              fontSize: "18px",
                              flexShrink: 0,
                              minWidth: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "4px",
                            }}
                            aria-label="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </form>
                    </div>
                  </div>

                  {/* Home */}
                  <div className="menu-section">
                    <Link
                      to="/"
                      className="menu-item main-nav-item"
                      onClick={closeMenu}
                    >
                      <span className="nav-item-name">Home</span>
                    </Link>
                  </div>

                  {/* Shop by Category */}
                  <div className="menu-section">
                    <div
                      className="menu-item category-trigger"
                      onClick={() =>
                        setIsShopByCategoryExpanded(!isShopByCategoryExpanded)
                      }
                    >
                      <span className="nav-item-name">Shop by Category</span>
                      <button
                        className="plus-icon-btn"
                        aria-label={
                          isShopByCategoryExpanded ? "Collapse" : "Expand"
                        }
                      >
                        <span className="plus-icon">
                          {isShopByCategoryExpanded ? "−" : "+"}
                        </span>
                      </button>
                    </div>

                    {isShopByCategoryExpanded && (
                      <div className="shop-by-category-content">
                        {categories.map((category) => {
                          const subcats = getSubcategoriesForCategory(
                            category.id
                          );
                          const isExpanded = expandedCategories.includes(
                            category.id
                          );
                          return (
                            <div key={category.id} className="category-group">
                              <div className="menu-item category-main">
                                <Link
                                  to={`/productListing?category=${encodeURIComponent(
                                    category.name
                                  )}`}
                                  className="category-link"
                                  onClick={closeMenu}
                                >
                                  <span className="category-icon">
                                    {category.icon}
                                  </span>
                                  <span className="category-name">
                                    {category.name}
                                  </span>
                                </Link>
                                {subcats.length > 0 && (
                                  <button
                                    className="plus-icon-btn"
                                    onClick={() => toggleExpand(category.id)}
                                    aria-label={
                                      isExpanded
                                        ? "Collapse category"
                                        : "Expand category"
                                    }
                                  >
                                    <span className="plus-icon">
                                      {isExpanded ? "−" : "+"}
                                    </span>
                                  </button>
                                )}
                              </div>
                              {isExpanded && subcats.length > 0 && (
                                <div className="subcategories-group">
                                  {subcats.map((subcategory) => {
                                    const isSubcatExpanded =
                                      expandedSubcategories.includes(
                                        subcategory.id
                                      );
                                    return (
                                      <div
                                        key={subcategory.id}
                                        className="subcategory-group"
                                      >
                                        <div className="menu-item subcategory-item">
                                          <Link
                                            to={`/productListing?subcategory=${encodeURIComponent(
                                              subcategory.name
                                            )}&category=${encodeURIComponent(
                                              category.name
                                            )}`}
                                            className="subcategory-link"
                                            onClick={closeMenu}
                                          >
                                            <span className="subcategory-name">
                                              {subcategory.name}
                                            </span>
                                          </Link>
                                          <button
                                            className="plus-icon-btn"
                                            onClick={() =>
                                              toggleSubcategoryExpand(
                                                subcategory.id
                                              )
                                            }
                                            aria-label={
                                              isSubcatExpanded
                                                ? "Collapse subcategory"
                                                : "Expand subcategory"
                                            }
                                          >
                                            <span className="plus-icon">
                                              {isSubcatExpanded ? "−" : "+"}
                                            </span>
                                          </button>
                                        </div>
                                        {/* Groups under subcategory - only show if subcategory is expanded */}
                                        {isSubcatExpanded && (
                                          <div className="groups-list">
                                            {getGroupsForSubcategory(
                                              subcategory.id
                                            ).map((group) => (
                                              <Link
                                                key={group.id}
                                                to={`/productListing?group=${encodeURIComponent(
                                                  group.name
                                                )}&subcategory=${encodeURIComponent(
                                                  subcategory.name
                                                )}&category=${encodeURIComponent(
                                                  category.name
                                                )}`}
                                                className="menu-item group-item"
                                                onClick={closeMenu}
                                              >
                                                <span className="group-name">
                                                  {group.name}
                                                </span>
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* E-Haat */}
                  {/* <div className="menu-section">
                    <Link
                      to="/BusinessPartner"
                      className="menu-item main-nav-item"
                      onClick={closeMenu}
                    >
                      <span className="nav-item-name">E-Haat </span>
                    </Link>
                  </div> */}

                  {/* Buisness Partner */}
                  <div className="menu-section">
                    <Link
                      to="/BusinessPartner"
                      className="menu-item main-nav-item"
                      onClick={closeMenu}
                    >
                      <span className="nav-item-name">Buisness Partner</span>
                    </Link>
                  </div>

                  {/* About Us */}
                  <div className="menu-section">
                    <Link
                      to="/about-us"
                      className="menu-item main-nav-item"
                      onClick={closeMenu}
                    >
                      <span className="nav-item-name">About Us</span>
                    </Link>
                  </div>

                  {/* Contact Us */}
                  <div className="menu-section">
                    <Link
                      to="/contact-us"
                      className="menu-item main-nav-item"
                      onClick={closeMenu}
                    >
                      <span className="nav-item-name">Contact Us</span>
                    </Link>
                  </div>

                  {/* Cart */}
                  <div className="menu-section">
                    <Link
                      to="/cart"
                      className="menu-item main-nav-item"
                      onClick={closeMenu}
                    >
                      <span className="nav-item-name">Cart</span>
                    </Link>
                  </div>
                </div>
                <button
                  className="border-0  items-center text-center font-bold text-xs text-black-800 transition-colors md:px-2 px-1 border-t"
                  onClick={handleSidebarLocationClick}
                >
                  {/* Location Selection Button */}
                  <Link
                    className=" flex items-center align-middle justify-center text-center font-bold rounded transition-colors"
                  >
                    <MapPinned className="pr-1 size-8" />
                    <span className="whitespace-nowrap">Current Location</span>
                  </Link>
                </button>
                {currentLocationAddress && (
                  <div className="mt-4 p-2 bg-gray-100 rounded text-sm text-center">
                    <span className="flex font-bold">Current Location:</span>{" "}
                    <span className="flex flex-wrap ">{currentLocationAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </>,
          menuPortalTarget
        )}

      {/* Desktop Search Overlay */}
      {searchOverlayOpen &&
        createPortal(
          <div
            className="desktop-search-overlay open"
            style={{
              position: "fixed",
              zIndex: 2000,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.98)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingTop: 80,
            }}
          >
            <button
              onClick={() => setSearchOverlayOpen(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "none",
                border: "none",
                fontSize: 28,
                color: "#333",
                zIndex: 1,
              }}
              aria-label="Close search"
            >
              ×
            </button>
            <form
              onSubmit={handleSearchSubmit}
              style={{
                width: "90%",
                maxWidth: 500,
                marginTop: 40,
                display: "flex",
                gap: 12,
              }}
            >
              <input
                type="search"
                placeholder="Search products..."
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  fontSize: 18,
                  borderRadius: 8,
                  border: "2px solid #ddd",
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit(e);
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0 24px",
                  fontSize: 16,
                  borderRadius: 8,
                  border: "none",
                  background: "#007bff",
                  color: "#fff",
                  fontWeight: 500,
                  cursor: "pointer",
                  height: 56,
                  minWidth: 100,
                }}
              >
                Search
              </button>
            </form>
          </div>,
          document.body
        )}
    </>
  );
};

export default CategoriesMenu;
