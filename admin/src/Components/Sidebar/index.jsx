import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { getAllUsers, getAllOrders } from "../../utils/supabaseApi";
import supabase from "../../utils/supabase";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardFill,
  RiQuestionnaireFill,
  RiSettings4Fill,
  RiShutDownLine,
  RiPrinterFill,
} from "react-icons/ri";
import { FaUsers, FaAngleDown, FaList, FaPlus, FaTag, FaDatabase } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { HiArchive } from "react-icons/hi";
import { MdCategory } from "react-icons/md";
import { GiTargetPoster } from "react-icons/gi";
import { Tooltip } from "@mantine/core";

const menuAnimation = {
  hidden: { opacity: 0, height: 0 },
  show: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
};

const Sidebar = ({ isOpen = true }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submenuIndex, setSubmenuIndex] = useState(null);
  // Sidebar counts
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      const usersRes = await getAllUsers();
      setUserCount(usersRes.users?.length || 0);
      const ordersRes = await getAllOrders();
      setOrderCount(ordersRes.orders?.length || 0);
      const { data: products } = await supabase.from("products").select();
      setProductCount(products?.length || 0);
      // Only count enquiries where status is 'pending' and type is not 'custom_printing'
      const { data: enquiries } = await supabase
        .from("enquiries")
        .select()
        .eq("status", "pending")
        .or("type.is.null,type.neq.custom_printing");
      setEnquiryCount(enquiries?.length || 0);
    }
    fetchCounts();
  }, []);

  // Close submenu when navigating to a new page
  useEffect(() => {
    setSubmenuIndex(null);
  }, [location.pathname]);

  const isOpenSubMenu = (index) => {
    if (submenuIndex === index) {
      setSubmenuIndex(null);
    } else {
      setSubmenuIndex(index);
    }
  };

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define sidebar menu items
  const menuItems = [
    {
      title: "Dashboard",
      icon: <RiDashboardFill />,
      path: "/",
    },
    {
      title: "Print Requests",
      icon: <RiPrinterFill />,
      path: "/print-requests",
    },
    {
      title: "Enquiries",
      icon: <RiQuestionnaireFill />,
      path: "/enquiry",
      badge: enquiryCount,
    },
    {
      title: "Products",
      icon: <HiArchive />,
    
      path: "/products",
    },
    {
      title: "Categories",
      icon: <MdCategory />,
      path: "/categories",
    },
    {
      title: "Banners",
      icon: <GiTargetPoster />,
      path: "/banners",
    },
    {
      title: "Promotions",
      icon: <FaTag />,
      path: "/promotional-settings",
      description: "Manage promotional banners, offers, and marketing content",
    },
    {
      title: "Storage",
      icon: <FaDatabase />,
      path: "/storage/enhanced",
      description: "Manage storage usage and files",
    },
    // {
    //   title: "Orders",
    //   icon: <FaList />,
    //   path: "/orders",
    //   badge: orderCount,
    // },
    // Users: Manage users, roles, add/delete/change role
    {
      title: "Users",
      icon: <FaUsers />,
      path: "/users",
      badge: userCount,
      description: "Manage users, roles, add, delete, change role",
    },
    {
      title: "Business Partners",
      icon: <FaList />,
      path: "/business-data",
    },
    {
      title: "Settings",
      icon: <RiSettings4Fill />,
      path: "/settings",
    },
  ];

  return (
    <motion.div
      className="fixed top-0 left-0 h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg z-20"
      animate={{
        width: isOpen ? "240px" : "70px",
        transition: { duration: 0.3, type: "spring", stiffness: 120 },
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo section */}
        <motion.div
          className="p-4 flex items-center"
          animate={{ justifyContent: isOpen ? "flex-start" : "center" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 shadow-lg">
            <motion.span
              className="text-white font-bold text-xl"
              animate={{ opacity: 1 }}
            >
              A
            </motion.span>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 font-semibold text-lg"
              >
                Admin Panel
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Section */}
        <div className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index} className="mb-1">
                {item.submenu ? (
                  <div className="mb-1">
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all duration-200 ${
                        submenuIndex === index
                          ? "bg-slate-700"
                          : "hover:bg-slate-700/50"
                      }`}
                      onClick={() => isOpenSubMenu(index)}
                    >
                      <Tooltip
                        label={item.title}
                        position="right"
                        disabled={isOpen}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{item.icon}</span>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm font-medium"
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </Tooltip>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={{
                              opacity: 1,
                              rotate: submenuIndex === index ? 180 : 0,
                            }}
                            exit={{ opacity: 0 }}
                            className="text-gray-400"
                          >
                            <FaAngleDown />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {submenuIndex === index && (
                        <motion.ul
                          variants={menuAnimation}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="mt-1 ml-3 space-y-1 border-l-2 border-slate-700 pl-3"
                        >
                          {item.submenu.map((submenuItem, subIndex) => (
                            <li key={subIndex} className="mb-1">
                              <Tooltip
                                label={submenuItem.title}
                                position="right"
                                disabled={isOpen}
                              >
                                <Link
                                  to={submenuItem.path}
                                  className={`flex items-center p-2 text-sm rounded-md transition-colors ${
                                    isActive(submenuItem.path)
                                      ? "bg-slate-700 text-white"
                                      : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                                  }`}
                                >
                                  <span className="text-base mr-3">
                                    {submenuItem.icon}
                                  </span>
                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-sm"
                                      >
                                        {submenuItem.title}
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </Link>
                              </Tooltip>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Tooltip
                    label={item.title}
                    position="right"
                    disabled={isOpen}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center p-2.5 text-sm rounded-md transition-colors ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                          : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-medium flex items-center"
                          >
                            {item.title}
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="ml-2 bg-pink-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                                {item.badge}
                              </span>
                            )}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </Tooltip>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-3 mt-auto">
          <Tooltip label="Logout" position="right" disabled={isOpen}>
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="flex items-center justify-center w-full p-2 text-sm text-gray-300 rounded-md hover:bg-red-500/90 hover:text-white transition-colors"
            >
              <span className="text-xl mr-2">
                <RiShutDownLine />
              </span>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
