import React, { useState } from "react";
import { useMantineColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Link } from "react-router-dom";
import {
  TextInput,
  ActionIcon,
  useMantineTheme,
  Menu,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  Badge,
  Divider,
  Indicator,
} from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { motion } from "framer-motion";
import {
  FaBell,
  FaCog,
  FaSearch,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaEnvelope,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { notifications } from "@mantine/notifications";

const userNotifications = [
  {
    id: 1,
    title: "New order received",
    message: "Order #12345 has been placed",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Payment successful",
    message: "Payment for order #12340 was successful",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "New user registered",
    message: "Arjun Sharma has registered",
    time: "Yesterday",
    read: true,
  },
  {
    id: 4,
    title: "Inventory alert",
    message: "Product X is running low on stock",
    time: "2 days ago",
    read: true,
  },
];

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { currentUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  // const unreadNotifications = userNotifications.filter(n => !n.read).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="z-10 w-full py-3 px-6 mantine-header flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center">
        <ActionIcon
          size="lg"
          radius="md"
          variant="light"
          onClick={toggleSidebar}
          className="mr-4"
        >
          <FaBars size={18} />
        </ActionIcon>

        <div
          className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md cursor-pointer"
          onClick={() => spotlight.open()}
        >
          <FaSearch size={14} className="text-gray-500" />
          <Text size="sm" color="dimmed">
            Search (Ctrl+K)
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex items-center cursor-pointer"
          onClick={toggleColorScheme}
          title="Toggle color scheme"
        >
          <ActionIcon
            variant="light"
            radius="xl"
            size="lg"
            color={colorScheme === "dark" ? "yellow" : "blue"}
          >
            {colorScheme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
          </ActionIcon>
          <Text size="sm" className="ml-1">
            {colorScheme === "dark" ? "Light Mode" : "Dark Mode"}
          </Text>
        </div>

        {/* <Menu
          width={320}
          position="bottom-end"
          onClose={() => setNotificationMenuOpened(false)}
          onOpen={() => setNotificationMenuOpened(true)}
          opened={notificationMenuOpened}
        >
          <Menu.Target>
            <Indicator 
              inline 
              label={unreadNotifications > 0 ? unreadNotifications : null} 
              size={16} 
              color="red" 
              withBorder
              disabled={unreadNotifications === 0}
            >
              <ActionIcon variant="light" radius="xl" size="lg">
                <FaBell size={18} />
              </ActionIcon>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown>
            <div className="p-2">
              <Group position="apart" className="mb-2">
                <Text weight={600}>Notifications</Text>
                <Badge>{unreadNotifications} new</Badge>
              </Group>
              <Divider className="mb-2" />
              {userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 rounded-md mb-2 cursor-pointer hover:bg-gray-100 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <Text size="sm" weight={600}>
                      {notification.title}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {notification.time}
                    </Text>
                  </div>
                  <Text size="xs" color="dimmed" className="mt-1">
                    {notification.message}
                  </Text>
                </div>
              ))}
              <Divider className="my-2" />
              <UnstyledButton className="w-full text-center text-sm text-blue-500 hover:underline">
                View all notifications
              </UnstyledButton>
            </div>
          </Menu.Dropdown>
        </Menu> */}

        <Menu
          width={260}
          position="bottom-end"
          onClose={() => setUserMenuOpened(false)}
          onOpen={() => setUserMenuOpened(true)}
          opened={userMenuOpened}
        >
          <Menu.Target>
            <UnstyledButton className="flex items-center">
              <Group spacing={7}>
                <Avatar
                  src={currentUser?.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  radius="xl"
                  size={36}
                />
                <div className="hidden md:block">
                  <Text size="sm" weight={500}>
                    {currentUser?.user_metadata?.name || currentUser?.user_metadata?.displayName || currentUser?.email || 'Admin'}
                  </Text>
                  <Text color="dimmed" size="xs">
                    Administrator
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item icon={<FaUser size={14} />} onClick={() => navigate('/profile')}>Profile</Menu.Item>
            {/* <Menu.Item icon={<FaEnvelope size={14} />} onClick={() => navigate('/messages')}>Messages</Menu.Item> */}
            <Menu.Item icon={<FaCog size={14} />} onClick={() => navigate('/settings')}>Settings</Menu.Item>
            <Divider />
            <Menu.Item
              color="red"
              icon={<FaSignOutAlt size={14} />}
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </motion.header>
  );
};

export default Header;
