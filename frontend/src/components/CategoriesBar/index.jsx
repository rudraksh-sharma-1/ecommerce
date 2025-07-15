import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPinned } from "lucide-react";
import {
  getAllCategories,
  getAllSubcategories,
  getAllGroups,
  getActiveCategories,
} from "../../utils/supabaseApi";
import { useAuth } from "../../contexts/AuthContext";
import CategoriesMenu from "../CategoriesMenu";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdClose } from "react-icons/md";
import { ArrowDown } from "lucide-react";
import { FaHome } from "react-icons/fa";
import {
  MdCategory,
  MdOutlineShoppingCart,
  MdMenu,
  MdSearch,
} from "react-icons/md";
import "./style.css";

const CategoriesBar = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAnnouncementBar, setHasAnnouncementBar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allCategories, setAllCategories] = useState([]); // For mobile menu
  const [openSubmenu, setOpenSubmenu] = useState([]); // For mobile menu category/subcategory expansion
  const { currentUser, logout } = useAuth();
  const categoryRefs = useRef({});
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Remove hoveredCategory and isDropdownHovered from state, use refs instead
  const hoveredCategoryRef = useRef(null);
  const hoveredSubcategoryRef = useRef(null);
  const isDropdownHoveredRef = useRef(false);
  const isGroupsDropdownHoveredRef = useRef(false);
  const [dropdownRender, setDropdownRender] = useState({
    categoryId: null,
    position: { top: 0, left: 0 },
  });
  const [groupsDropdownRender, setGroupsDropdownRender] = useState({
    subcategoryId: null,
    position: { top: 0, left: 0 },
  });

  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const location = useLocation();

  useEffect(() => {
    fetchCategoriesSubcategoriesAndGroups();

    // Check if announcement bar is present
    const checkAnnouncementBar = () => {
      const announcementElement = document.querySelector(".announcement-bar");
      setHasAnnouncementBar(!!announcementElement);
    };

    checkAnnouncementBar();

    // Listen for changes in case announcement bar is dynamically added/removed
    const observer = new MutationObserver(checkAnnouncementBar);
    observer.observe(document.body, { childList: true, subtree: true });

    // Handle window resize to recalculate dropdown positions
    const handleResize = () => {
      if (hoveredCategoryRef.current) {
        const categoryElement =
          categoryRefs.current[hoveredCategoryRef.current];
        if (categoryElement) {
          const position = calculateDropdownPosition(categoryElement);
          setDropdownRender((prev) => ({ ...prev, position }));
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("mobile-menu-open");
      // Do NOT auto-expand "Shop by Category" - keep it collapsed by default
    } else {
      document.body.classList.remove("mobile-menu-open");
      // Reset submenu state when menu closes
      setOpenSubmenu([]);
    }

    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileMenuOpen]);

  const fetchCategoriesSubcategoriesAndGroups = async () => {
    setLoading(true);
    try {
      const [categoriesResult, subcategoriesResult, groupsResult] =
        await Promise.all([
          getAllCategories(),
          getAllSubcategories(),
          getAllGroups(),
        ]);

      if (categoriesResult.success && categoriesResult.categories) {
        // Show only featured and active categories in the top bar, limit to 8
        const featuredCategories = categoriesResult.categories.filter(
          (cat) => cat.active && cat.featured
        );
        /* .slice(0, 8); */
        setCategories(featuredCategories);

        // Store all active categories for mobile menu
        const activeCategories = categoriesResult.categories.filter(
          (cat) => cat.active
        );
        setAllCategories(activeCategories);
      }

      if (subcategoriesResult.success && subcategoriesResult.subcategories) {
        setSubcategories(
          subcategoriesResult.subcategories.filter((sub) => sub.active)
        );
      }

      if (groupsResult.success && groupsResult.groups) {
        const activeGroups = groupsResult.groups.filter(
          (group) => group.active
        );
        setGroups(activeGroups);
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
    const groupsForSubcategory = groups.filter(
      (group) => group.subcategory_id === subcategoryId
    );
    return groupsForSubcategory;
  };

  // Mobile menu functions
  const toggleSubmenu = (key) => {
    setOpenSubmenu((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenSubmenu([]);
  };

  // Calculate dropdown position dynamically
  const calculateDropdownPosition = (categoryElement) => {
    if (!categoryElement) return { top: 0, left: 0 };

    const categoriesBar = document.querySelector(".categories-bar");
    const categoriesBarRect = categoriesBar?.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (!categoriesBarRect) return { top: 0, left: 0 };

    // Responsive dropdown width
    let dropdownWidth = Math.min(windowWidth - 16, 420); // 8px margin each side
    if (windowWidth <= 480) dropdownWidth = Math.min(windowWidth - 8, 320);
    if (windowWidth <= 360) dropdownWidth = Math.min(windowWidth - 4, 260);

    // Always align dropdown to left edge of screen on mobile
    let left = 0;
    if (windowWidth > 768) {
      // Desktop: center on category
      const rect = categoryElement.getBoundingClientRect();
      left = rect.left + rect.width / 2 - dropdownWidth / 2;
      if (left < 8) left = 8;
      if (left + dropdownWidth > windowWidth - 8)
        left = windowWidth - dropdownWidth - 8;
    }

    // Vertical position
    let top = categoriesBarRect.bottom + 4;
    let dropdownHeight = 340;
    if (windowWidth <= 480) dropdownHeight = 320;
    if (windowWidth <= 360) dropdownHeight = 260;
    if (top + dropdownHeight > windowHeight - 8) {
      top = windowHeight - dropdownHeight - 8;
      if (top < categoriesBarRect.bottom + 4)
        top = categoriesBarRect.bottom + 4;
    }

    return {
      top,
      left,
      width: dropdownWidth,
    };
  };

  // Calculate groups dropdown position (positioned to the right of subcategory item)
  const calculateGroupsDropdownPosition = (subcategoryElement) => {
    if (!subcategoryElement) return { top: 0, left: 0 };

    const rect = subcategoryElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dropdownWidth = 250;
    const dropdownHeight = 300;

    let left = rect.right + 8; // Position to the right with small gap
    let top = rect.top - 4; // Align with subcategory item

    // Ensure dropdown doesn't go off-screen horizontally
    const margin = 8;
    if (left + dropdownWidth > windowWidth - margin) {
      left = rect.left - dropdownWidth - 8;
    }
    if (left < margin) {
      left = margin;
    }

    // Ensure dropdown doesn't go off-screen vertically
    if (top + dropdownHeight > windowHeight - margin) {
      top = windowHeight - dropdownHeight - margin;
      if (top < 0) top = 0;
    }
    if (top < margin) {
      top = margin;
    }

    return {
      top,
      left,
    };
  };

  const handleCategoryMouseEnter = (categoryId, event) => {
    hoveredCategoryRef.current = categoryId;
    hoveredSubcategoryRef.current = null;
    isDropdownHoveredRef.current = true;
    isGroupsDropdownHoveredRef.current = false;
    const position = calculateDropdownPosition(event.currentTarget);
    setDropdownRender({ categoryId, position });
    setGroupsDropdownRender({
      subcategoryId: null,
      position: { top: 0, left: 0 },
    });
  };

  const handleCategoryMouseLeave = () => {
    isDropdownHoveredRef.current = false;
    setTimeout(() => {
      if (
        !isDropdownHoveredRef.current &&
        !isGroupsDropdownHoveredRef.current
      ) {
        setDropdownRender({ categoryId: null, position: { top: 0, left: 0 } });
        setGroupsDropdownRender({
          subcategoryId: null,
          position: { top: 0, left: 0 },
        });
      }
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    isDropdownHoveredRef.current = true;
  };

  const handleDropdownMouseLeave = () => {
    isDropdownHoveredRef.current = false;
    setTimeout(() => {
      if (
        !isDropdownHoveredRef.current &&
        !isGroupsDropdownHoveredRef.current
      ) {
        setDropdownRender({ categoryId: null, position: { top: 0, left: 0 } });
        setGroupsDropdownRender({
          subcategoryId: null,
          position: { top: 0, left: 0 },
        });
      }
    }, 150);
  };

  const handleSubcategoryMouseEnter = (subcategoryId, event) => {
    const groupsForThisSubcategory = getGroupsForSubcategory(subcategoryId);
    if (groupsForThisSubcategory.length > 0) {
      hoveredSubcategoryRef.current = subcategoryId;
      isGroupsDropdownHoveredRef.current = true;
      const position = calculateGroupsDropdownPosition(event.currentTarget);
      setGroupsDropdownRender({ subcategoryId, position });
    }
  };

  const handleSubcategoryMouseLeave = () => {
    setTimeout(() => {
      if (!isGroupsDropdownHoveredRef.current) {
        setGroupsDropdownRender({
          subcategoryId: null,
          position: { top: 0, left: 0 },
        });
      }
    }, 150);
  };

  const handleGroupsDropdownMouseEnter = () => {
    isGroupsDropdownHoveredRef.current = true;
  };

  const handleGroupsDropdownMouseLeave = () => {
    isGroupsDropdownHoveredRef.current = false;
    setTimeout(() => {
      if (!isGroupsDropdownHoveredRef.current) {
        setGroupsDropdownRender({
          subcategoryId: null,
          position: { top: 0, left: 0 },
        });
      }
    }, 150);
  };

  // Search handler for overlay and mobile sidebar
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOverlayOpen(false);
      navigate(
        `/productListing?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery("");
    }
  };

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hoveredCategoryRef.current &&
        !event.target.closest(".category-item-container") &&
        !event.target.closest(".subcategories-dropdown") &&
        !event.target.closest(".groups-dropdown")
      ) {
        setDropdownRender({ categoryId: null, position: { top: 0, left: 0 } });
        setGroupsDropdownRender({
          subcategoryId: null,
          position: { top: 0, left: 0 },
        });
      }
    };

    const handleEscapeKey = (event) => {
      if (
        event.key === "Escape" &&
        (hoveredCategoryRef.current || hoveredSubcategoryRef.current)
      ) {
        setDropdownRender({ categoryId: null, position: { top: 0, left: 0 } });
        setGroupsDropdownRender({
          subcategoryId: null,
          position: { top: 0, left: 0 },
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Add handler for bottom nav menu
  const handleBottomMenu = (type) => {
    if (type === "menu") {
      setMobileMenuOpen(true);
      setOpenSubmenu([]); // Collapse all categories when Menu is pressed
    }
    if (type === "category") {
      setMobileMenuOpen(true);
      setOpenSubmenu((prev) =>
        prev.includes("shop-by-category") ? prev : [...prev, "shop-by-category"]
      );
    }
    if (type === "home") navigate("/");
    if (type === "cart") navigate("/cart");
  };

  return (
    <>
      <div
        className={`categories-bar ${
          hasAnnouncementBar ? "with-announcement-bar" : ""
        }`}
      >
        <div className="categories-bar-container">
          <div className="categories-bar-content max-w-5xl">
            {/* Mobile ALL Menu Button - only visible on mobile */}
            <div className="md:hidden mobile-all-menu-wrapper ml-[-10px]">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-all-menu-button"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? <MdClose /> : <GiHamburgerMenu />}
              </button>
            </div>

            {/* Desktop All Categories Menu Button - hidden on mobile */}
            <div className="categories-menu-wrapper hidden md:block">
              <CategoriesMenu />
            </div>

            {/* Featured Categories */}
            <div className="featured-categories">
              {loading ? (
                <div className="loading-categories">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="category-skeleton" />
                  ))}
                </div>
              ) : (
                categories.map((category) => {
                  const categorySubcategories = getSubcategoriesForCategory(
                    category.id
                  );
                  const hasSubcategories = categorySubcategories.length > 0;
                  const params = new URLSearchParams(location.search);
                  const isSelected = params.get("category") === category.name;
                  return (
                    <div
                      key={category.id}
                      className={`category-item-container${
                        isSelected ? " selected" : ""
                      }`}
                      ref={(el) => (categoryRefs.current[category.id] = el)}
                      onMouseEnter={(e) =>
                        handleCategoryMouseEnter(category.id, e)
                      }
                      onMouseLeave={handleCategoryMouseLeave}
                    >
                      {isDesktop ? (
                        // Desktop Link (visible only on larger screens)
                        <Link
                          to={`/productListing?group=${encodeURIComponent(
                            category.name
                          )}`}
                          className="category-item-link"
                        >
                          <div className="category-item-new !p-0 m-3">
                            <div className="category-name-container flex justify-between p-0 border-0 rounded-lg bg-[#fdf7f2] text-black">
                              <img
                                src={category.image_url}
                                alt="Category Image"
                                className="h-15 w-15 border-0 rounded-lg p-0"
                              />
                              <span className="category-name-text">
                                {category.name}
                              </span>
                              {hasSubcategories && (
                                <span className="text-xs hidden md:block pr-1 pl-4">
                                  ▼
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ) : (
                         <Link
                        to={`/subcategories/${encodeURIComponent(
                          category.name
                        )}`}
                        className="block md:hidden"
                      >
                        <div className="category-item-new !p-0 md:m-3">
                          <div className="category-name-container border-0 rounded-lg bg-[#fdf7f2] text-black">
                            <img
                              src={category.image_url}
                              alt="Category Image"
                              className="h-11 w-11 border-0 rounded-lg p-0"
                            />
                            <span className="category-name-text">
                              {category.name}
                            </span>
                            {hasSubcategories && (
                              <span className="text-xs">▼</span>
                            )}
                          </div>
                        </div>
                      </Link>
                      )}
                      {/* Subcategories Dropdown - Show on hover with fixed positioning */}
                      {hasSubcategories &&
                        dropdownRender.categoryId === category.id && (
                          <div
                            className="hidden md:block subcategories-dropdown"
                            style={{
                              position: "fixed",
                              top: `${dropdownRender.position.top}px`,
                              left: `${dropdownRender.position.left}px`,
                              width: dropdownRender.position.width || "420px",
                              minWidth:
                                dropdownRender.position.width || "340px",
                              maxWidth: "700px",
                              transform: "none",
                              // Increase dropdown width for both columns
                              // width: '520px', // was 300px or similar, now much wider
                              // minWidth: '520px',
                              // maxWidth: '700px',
                            }}
                            onMouseEnter={handleDropdownMouseEnter}
                            onMouseLeave={handleDropdownMouseLeave}
                          >
                            <div
                              className="subcategories-dropdown-content"
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                              }}
                            >
                              <div
                                className="subcategory-column"
                                style={{
                                  flex: 1,
                                  minWidth: "0",
                                  maxWidth: "50%",
                                  paddingRight: "16px",
                                }}
                              >
                                {categorySubcategories
                                  .slice(
                                    0,
                                    Math.ceil(categorySubcategories.length / 2)
                                  )
                                  .map((subcategory) => {
                                    const subcategoryGroups =
                                      getGroupsForSubcategory(subcategory.id);
                                    const hasGroups =
                                      subcategoryGroups.length > 0;
                                    return (
                                      <div
                                        key={subcategory.id}
                                        className="subcategory-item-container"
                                        onMouseEnter={(e) => {
                                          if (hasGroups) {
                                            handleSubcategoryMouseEnter(
                                              subcategory.id,
                                              e
                                            );
                                          }
                                        }}
                                        onMouseLeave={() => {
                                          if (hasGroups) {
                                            handleSubcategoryMouseLeave();
                                          }
                                        }}
                                      >
                                        <Link
                                          to={`/productListing?subcategory=${encodeURIComponent(
                                            subcategory.name
                                          )}&category=${encodeURIComponent(
                                            category.name
                                          )}`}
                                          className="subcategory-item"
                                        >
                                          {subcategory.image_url ? (
                                            <img
                                              src={subcategory.image_url}
                                              alt={subcategory.name}
                                              className="subcategory-image"
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                              }}
                                            />
                                          ) : null}
                                          <span className="subcategory-name">
                                            {subcategory.name}
                                          </span>
                                          {hasGroups && (
                                            <span className="subcategory-arrow">
                                              →
                                            </span>
                                          )}
                                        </Link>
                                      </div>
                                    );
                                  })}
                              </div>
                              <div
                                className="subcategory-column"
                                style={{
                                  flex: 1,
                                  minWidth: "0",
                                  maxWidth: "50%",
                                  paddingLeft: "16px",
                                }}
                              >
                                {categorySubcategories
                                  .slice(
                                    Math.ceil(categorySubcategories.length / 2)
                                  )
                                  .map((subcategory) => {
                                    const subcategoryGroups =
                                      getGroupsForSubcategory(subcategory.id);
                                    const hasGroups =
                                      subcategoryGroups.length > 0;
                                    return (
                                      <div
                                        key={subcategory.id}
                                        className="subcategory-item-container"
                                        onMouseEnter={(e) => {
                                          if (hasGroups) {
                                            handleSubcategoryMouseEnter(
                                              subcategory.id,
                                              e
                                            );
                                          }
                                        }}
                                        onMouseLeave={() => {
                                          if (hasGroups) {
                                            handleSubcategoryMouseLeave();
                                          }
                                        }}
                                      >
                                        <Link
                                          to={`/productListing?subcategory=${encodeURIComponent(
                                            subcategory.name
                                          )}&category=${encodeURIComponent(
                                            category.name
                                          )}`}
                                          className="subcategory-item"
                                        >
                                          {/* {subcategory.image_url ? (
                                            <img
                                              src={subcategory.image_url}
                                              alt={subcategory.name}
                                              className="subcategory-image"
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                              }}
                                            />
                                          ) : null} */}
                                          <span className="subcategory-name">
                                            {subcategory.name}
                                          </span>
                                          {hasGroups && (
                                            <span className="subcategory-arrow">
                                              →
                                            </span>
                                          )}
                                        </Link>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Groups Dropdown - rendered separately to avoid z-index conflicts */}
      {groupsDropdownRender.subcategoryId && (
        <div
          className="groups-dropdown"
          style={{
            position: "fixed",
            top: `${groupsDropdownRender.position.top}px`,
            left: `${groupsDropdownRender.position.left}px`,
            transform: "none",
            zIndex: 10001,
          }}
          onMouseEnter={handleGroupsDropdownMouseEnter}
          onMouseLeave={handleGroupsDropdownMouseLeave}
        >
          <div className="groups-dropdown-content">
            {(() => {
              const subcategory = subcategories.find(
                (sub) => sub.id === groupsDropdownRender.subcategoryId
              );
              const subcategoryGroups = getGroupsForSubcategory(
                groupsDropdownRender.subcategoryId
              );
              const category = categories.find(
                (cat) => cat.id === subcategory?.category_id
              );

              return subcategoryGroups.map((group) => (
                <Link
                  key={group.id}
                  to={`/productListing?group=${encodeURIComponent(
                    group.name
                  )}&subcategory=${encodeURIComponent(
                    subcategory?.name || ""
                  )}&category=${encodeURIComponent(category?.name || "")}`}
                  className="group-item"
                >
                  {/* {group.image_url ? (
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="group-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : null} */}
                  <span className="group-name">{group.name}</span>
                </Link>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Spacer to push content below the fixed bar, only on homepage */}
      {location.pathname === "/" && <div className="categories-bar-spacer" />}

      {/* Mobile Menu Sidebar - only visible on mobile */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
      >
        <div
          className="mobile-menu-container"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Mobile menu container clicked"); // Debug log
          }}
        >
          <div className="mobile-menu-header">
            <h2>Menu</h2>
            <button
              className="close-menu-btn"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <MdClose size={24} />
            </button>
          </div>

          <div className="mobile-menu-content">
            <ul className="mobile-nav-list">
              <li>
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
                      gap: "8px",
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      border: "2px solid #e9ecef",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <MdSearch
                      size={18}
                      style={{ color: "#666", flexShrink: 0 }}
                    />
                    <input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        border: "none",
                        background: "#fff",
                        outline: "none",
                        fontSize: "16px",
                        width: "100%",
                        color: "#333",
                        fontFamily: "inherit",
                        WebkitAppearance: "none",
                        height: "20px",
                        lineHeight: "20px",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchSubmit();
                          closeMobileMenu();
                        }
                      }}
                      onFocus={(e) => {
                        e.target.parentElement.style.borderColor = "#007bff";
                      }}
                      onBlur={(e) => {
                        e.target.parentElement.style.borderColor = "#e9ecef";
                      }}
                    />
                  </form>
                </div>
              </li>

              <li>
                <Link to="/" onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>

              <li className="has-submenu">
                <div
                  className="submenu-trigger"
                  onClick={() => toggleSubmenu("shop-by-category")}
                >
                  <span>Shop by Category</span>
                </div>

                <ul
                  className={`mobile-submenu ${
                    openSubmenu.includes("shop-by-category") ? "open" : ""
                  }`}
                >
                  {allCategories.map((category) => {
                    const categorySubcategories = getSubcategoriesForCategory(
                      category.id
                    );
                    return (
                      <li key={category.id} className="category-menu-item">
                        {categorySubcategories.length > 0 ? (
                          <div className="category-item-wrapper">
                            <div
                              className={`category-item-content ${
                                openSubmenu.includes(category.id)
                                  ? "expanded"
                                  : ""
                              }`}
                              onClick={(e) => {
                                // Only expand/collapse if NOT clicking the text link
                                const link = e.currentTarget.querySelector(
                                  ".category-text-link"
                                );
                                if (
                                  link &&
                                  (e.target === link || link.contains(e.target))
                                ) {
                                  // Let navigation happen
                                  return;
                                }
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSubmenu(category.id);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <Link
                                to={`/productListing?category=${encodeURIComponent(
                                  category.name
                                )}`}
                                className="category-text-link"
                                style={{ display: "inline-block" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeMobileMenu();
                                }}
                              >
                                {category.name}
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/productListing?category=${encodeURIComponent(
                              category.name
                            )}`}
                            className="category-text-link full-width"
                            onClick={closeMobileMenu}
                          >
                            {category.name}
                          </Link>
                        )}

                        {categorySubcategories.length > 0 && (
                          <ul
                            className={`mobile-submenu ${
                              openSubmenu.includes(category.id) ? "open" : ""
                            }`}
                          >
                            {categorySubcategories.map((subcategory) => {
                              const subcategoryGroups = getGroupsForSubcategory(
                                subcategory.id
                              );
                              return (
                                <li
                                  key={subcategory.id}
                                  className="category-menu-item"
                                >
                                  {subcategoryGroups.length > 0 ? (
                                    <div className="category-item-wrapper">
                                      <div
                                        className={`category-item-content ${
                                          openSubmenu.includes(
                                            `${category.id}-${subcategory.id}`
                                          )
                                            ? "expanded"
                                            : ""
                                        }`}
                                        onClick={(e) => {
                                          const link =
                                            e.currentTarget.querySelector(
                                              ".category-text-link"
                                            );
                                          if (
                                            link &&
                                            (e.target === link ||
                                              link.contains(e.target))
                                          ) {
                                            return;
                                          }
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleSubmenu(
                                            `${category.id}-${subcategory.id}`
                                          );
                                        }}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <Link
                                          to={`/productListing?subcategory=${encodeURIComponent(
                                            subcategory.name
                                          )}&category=${encodeURIComponent(
                                            category.name
                                          )}`}
                                          className="category-text-link"
                                          style={{ display: "inline-block" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            closeMobileMenu();
                                          }}
                                        >
                                          {subcategory.name}
                                        </Link>
                                      </div>
                                    </div>
                                  ) : (
                                    <Link
                                      to={`/productListing?subcategory=${encodeURIComponent(
                                        subcategory.name
                                      )}&category=${encodeURIComponent(
                                        category.name
                                      )}`}
                                      className="category-text-link full-width"
                                      onClick={closeMobileMenu}
                                    >
                                      {subcategory.name}
                                    </Link>
                                  )}
                                  {subcategoryGroups.length > 0 && (
                                    <ul
                                      className={`mobile-submenu ${
                                        openSubmenu.includes(
                                          `${category.id}-${subcategory.id}`
                                        )
                                          ? "open"
                                          : ""
                                      }`}
                                    >
                                      <li>
                                        <Link
                                          to={`/productListing?subcategory=${encodeURIComponent(
                                            subcategory.name
                                          )}&category=${encodeURIComponent(
                                            category.name
                                          )}`}
                                          onClick={closeMobileMenu}
                                        >
                                          Menu {subcategory.name}
                                        </Link>
                                      </li>
                                      {subcategoryGroups.map((group) => (
                                        <li key={group.id}>
                                          <Link
                                            to={`/productListing?group=${encodeURIComponent(
                                              group.name
                                            )}&subcategory=${encodeURIComponent(
                                              subcategory.name
                                            )}&category=${encodeURIComponent(
                                              category.name
                                            )}`}
                                            onClick={closeMobileMenu}
                                          >
                                            {group.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>

              <li>
                <Link to="/BusinessPartner" onClick={closeMobileMenu}>
                  Business Partner
                </Link>
              </li>
              <li>
                <Link to="/about-us" onClick={closeMobileMenu}>
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/contact-us" onClick={closeMobileMenu}>
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to="/cart" onClick={closeMobileMenu}>
                  Cart
                </Link>
              </li>
            </ul>
            <div
              className="mobile-menu-footer"
              style={{
                marginTop: "auto",
                padding: "16px 16px 16px",
                borderTop: "1px solid #eee",
                textAlign: "center",
                fontSize: "15px",
              }}
            >
              {currentUser ? (
                <>
                  <span>
                    Hello{" "}
                    {currentUser.name ||
                      currentUser.user_metadata?.name ||
                      currentUser.email ||
                      "User"}
                    !
                  </span>
                  <br />
                  <button
                    onClick={async () => {
                      await logout();
                      closeMobileMenu();
                      navigate("/"); // Optionally redirect to homepage after logout
                    }}
                    style={{
                      marginLeft: "16px",
                      color: "#d32f2f",
                      background: "none",
                      border: "none",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                    className="text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    style={{
                      marginRight: "8px",
                      color: "#007bff",
                      textDecoration: "none",
                    }}
                  >
                    Login
                  </Link>
                  <span style={{ color: "#888" }}>|</span>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    style={{
                      marginLeft: "8px",
                      color: "#007bff",
                      textDecoration: "none",
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            <div className="pb-13 w-full">
              {/* Location Selection Button */}
              <button className="w-full border-0  items-center text-center font-bold text-xs text-black-800 transition-colors md:px-2 px-1 border-t  ">
                <Link
                  to="/account"
                  className=" flex items-center align-middle justify-center text-center font-bold rounded transition-colors"
                >
                  <MapPinned className="pr-1 size-8" />
                  <span className="whitespace-nowrap">Current Location</span>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar for Mobile Only */}
      <div
        className="mobile-bottom-nav-bar"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "54px",
          background: "#fff",
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 1200,
        }}
      >
        <button
          className="mobile-bottom-nav-btn"
          aria-label="Home"
          onClick={() => handleBottomMenu("home")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: 0,
          }}
        >
          <FaHome size={22} />
          <span style={{ fontSize: "11px" }}>Home</span>
        </button>
        <button
          className="mobile-bottom-nav-btn"
          aria-label="Category"
          onClick={() => handleBottomMenu("category")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: 0,
          }}
        >
          <MdCategory size={22} />
          <span style={{ fontSize: "11px" }}>Category</span>
        </button>
        <button
          className="mobile-bottom-nav-btn"
          aria-label="Cart"
          onClick={() => handleBottomMenu("cart")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: 0,
          }}
        >
          <MdOutlineShoppingCart size={22} />
          <span style={{ fontSize: "11px" }}>Cart</span>
        </button>
        <button
          className="mobile-bottom-nav-btn"
          aria-label="Menu"
          onClick={() => handleBottomMenu("menu")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            padding: 0,
          }}
        >
          <MdMenu size={22} />
          <span style={{ fontSize: "11px" }}>Menu</span>
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {searchOverlayOpen && (
        <div
          className="mobile-search-overlay open"
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
            paddingTop: 40,
          }}
        >
          <button
            onClick={() => setSearchOverlayOpen(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
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
              maxWidth: 400,
              marginTop: 32,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="search"
              placeholder="Search products..."
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: 18,
                borderRadius: 8,
                border: "1px solid #ccc",
                outline: "none",
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
                padding: "0 18px",
                fontSize: 16,
                borderRadius: 8,
                border: "none",
                background: "#007bff",
                color: "#fff",
                fontWeight: 500,
                cursor: "pointer",
                height: 48,
              }}
            >
              Search
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default React.memo(CategoriesBar);
