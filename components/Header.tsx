import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FaHome,
  FaInfoCircle,
  FaComments,
  FaChevronDown,
  FaTachometerAlt,
  FaCog,
  FaUserShield,
  FaUserCircle,
  FaSignOutAlt,
  FaUserEdit,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import InfoSideBar from "./InfoSidebar";
import NotificationBar from "./NotificationBar";
import MessageSidebar from "./MessageSideBar";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserType, MenuItem } from "../components/types/types";

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageSidebarOpen, setIsMessageSidebarOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const infoSidebarRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messageSidebarRef = useRef<HTMLDivElement>(null);

  const HeaderStyle = "J4All";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sample notifications data
  const notifications = useMemo(
    () => [
      {
        id: 1,
        type: "alert",
        title: "System Maintenance",
        message:
          "Scheduled maintenance on June 20, 2023 from 2:00 AM to 4:00 AM UTC",
        time: "10 min ago",
        icon: <FaExclamationTriangle className="text-yellow-500" />,
      },
      {
        id: 2,
        type: "success",
        title: "Update Completed",
        message: "Version 2.3.1 has been successfully deployed",
        time: "1 hour ago",
        icon: <FaCheckCircle className="text-green-500" />,
      },
      {
        id: 3,
        type: "alert",
        title: "Storage Warning",
        message: "Database storage is at 85% capacity",
        time: "3 hours ago",
        icon: <FaExclamationTriangle className="text-yellow-500" />,
      },
    ],
    []
  );
  const conversations = useMemo(
    () => [
      {
        id: 1,
        title: "Project Status Update",
        participants: ["John Doe", "You"],
        lastMessage: "Actually, could you review the API docs...",
        lastMessageTime: "10:35 AM",
        unreadCount: 0,
        participant: "John Doe",
        time: "10:35 AM",
      },
      {
        id: 2,
        title: "Meeting Request",
        participants: ["Sarah Johnson", "You"],
        lastMessage: "Perfect! Looking forward to our discussion...",
        lastMessageTime: "11:48 AM",
        unreadCount: 0,
        participant: "Sarah Johnson",
        time: "11:48 AM",
      },
      {
        id: 3,
        title: "Design Specs Review",
        participants: ["Alex Chen", "You"],
        lastMessage: "Just sent them. Let me know if...",
        lastMessageTime: "3:25 PM",
        unreadCount: 1,
        participant: "Alex Chen",
        time: "3:25 PM",
      },
      {
        id: 4,
        title: "System Notifications",
        participants: ["System"],
        lastMessage: "Your storage is 85% full...",
        lastMessageTime: "12:00 PM",
        unreadCount: 0,
        isSystem: true,
        participant: "System",
        time: "12:00 PM",
      },
    ],
    []
  );
  // Sample messages data
  const messages = useMemo(
    () => [
      {
        id: 1,
        sender: "John Doe",
        text: "Hey, how's the project coming along?",
        time: "10:30 AM",
        isCurrentUser: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Going well! Should be done by Friday.",
        time: "10:32 AM",
        isCurrentUser: true,
      },
      {
        id: 3,
        sender: "John Doe",
        text: "Great to hear! Let me know if you need anything.",
        time: "10:33 AM",
        isCurrentUser: false,
      },
    ],
    []
  );

  const getDashboardPath = (user_type: UserType): string => {
    switch (user_type) {
      case "pwd":
        return "/ApplicantDashboard";
      case "indigenous":
        return "/ApplicantDashboard";
      case "employer":
        return "/EmployerDashboard";
      case "general":
        return "/AdminDashboard";
      default:
        return "/";
    }
  };

  const handleLogoClick = useCallback(() => {
    const path = getDashboardPath(user?.user_type || "general");
    console.log("Navigating to:", path);
    navigate(path);
  }, [navigate, user?.user_type]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const toggleInfoSidebar = useCallback(() => {
    setIsInfoSidebarOpen((prev) => !prev);
    if (!isInfoSidebarOpen) {
      setIsDropdownOpen(false);
      setIsProfileDropdownOpen(false);
      setIsNotificationOpen(false);
      setIsMessageSidebarOpen(false);
    }
  }, [isInfoSidebarOpen]);

  const toggleNotification = useCallback(() => {
    setIsNotificationOpen((prev) => {
      if (!prev) {
        setIsDropdownOpen(false);
        setIsProfileDropdownOpen(false);
        setIsInfoSidebarOpen(false);
        setIsMessageSidebarOpen(false);
      }
      return !prev;
    });
  }, []);

  const toggleMessageSidebar = useCallback(() => {
    setIsMessageSidebarOpen((prev) => {
      if (!prev) {
        setIsDropdownOpen(false);
        setIsProfileDropdownOpen(false);
        setIsInfoSidebarOpen(false);
        setIsNotificationOpen(false);
      }
      return !prev;
    });
  }, []);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src = DEFAULT_PROFILE_IMAGE;
      target.onerror = null;
    },
    []
  );

  const closeAllDropdowns = useCallback(() => {
    setIsDropdownOpen(false);
    setIsProfileDropdownOpen(false);
    setIsNotificationOpen(false);
    setIsMessageSidebarOpen(false);
  }, []);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        closeAllDropdowns();
        setIsInfoSidebarOpen(false);
        return;
      }

      if (!(event instanceof MouseEvent)) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }

      if (
        infoSidebarRef.current &&
        !infoSidebarRef.current.contains(event.target as Node)
      ) {
        setIsInfoSidebarOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }

      if (
        messageSidebarRef.current &&
        !messageSidebarRef.current.contains(event.target as Node)
      ) {
        setIsMessageSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleClickOutside);
    };
  }, [closeAllDropdowns]);

  const mainMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        icon: <FaTachometerAlt />,
        label: "Dashboard",
        path: getDashboardPath(user?.user_type || "general"),
      },
      // { icon: <FaUserShield />, label: "Admin Portal", path: "/admin" },
    ],
    [user?.user_type]
  );

  const profileMenuItems = useMemo<MenuItem[]>(
    () => [
      { icon: <FaUserCircle />, label: "Profile", path: "/profile" },
      { icon: <FaUserEdit />, label: "Edit Account", path: "/profile/edit" },
      { icon: <FaCog />, label: "Settings", path: "/settings" },
      {
        icon: <FaSignOutAlt />,
        label: "Logout",
        path: "#",
        className: "text-red-400",
        onClick: handleLogout,
      },
    ],
    [handleLogout]
  );

  const navIcons = useMemo(
    () => [
      {
        icon: (
          <div className="relative">
            <FaComments />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {messages.length}
              </span>
            )}
          </div>
        ),
        path: "#",
        label: "Messages",
        onClick: toggleMessageSidebar,
      },
      {
        icon: (
          <div className="relative">
            <FaBell />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
        ),
        path: "#",
        label: "Notifications",
        onClick: toggleNotification,
      },
    ],
    [
      toggleInfoSidebar,
      toggleNotification,
      toggleMessageSidebar,
      notifications.length,
      messages.length,
      user?.user_type,
    ]
  );

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => {
      if (!prev) {
        setIsProfileDropdownOpen(false);
        setIsInfoSidebarOpen(false);
        setIsNotificationOpen(false);
        setIsMessageSidebarOpen(false);
      }
      return !prev;
    });
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen((prev) => {
      if (!prev) {
        setIsDropdownOpen(false);
        setIsInfoSidebarOpen(false);
        setIsNotificationOpen(false);
        setIsMessageSidebarOpen(false);
      }
      return !prev;
    });
  }, []);

  const renderDropdownItem = useCallback(
    (item: MenuItem) => (
      <a
        key={item.path}
        href={item.path}
        className={`flex items-center px-4 py-2 text-sm hover:bg-gray-600 transition-colors ${
          item.className || ""
        }`}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            item.onClick();
          }
          closeAllDropdowns();
        }}
      >
        <span className="mr-2">{item.icon}</span>
        {item.label}
      </a>
    ),
    [closeAllDropdowns]
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-50 shadow-md">
        {/* Logo + Header - now with click handler */}
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleLogoClick()}
        >
          <img
            src="/Images/logo1.jpg"
            alt="Company Logo"
            className="h-8 w-8 mr-3 rounded-full object-cover"
            onError={handleImageError}
          />
          <h1 className="text-2xl font-bold mr-2">{HeaderStyle}</h1>
        </div>

        {/* Navigation Icons + Profile Dropdown */}
        <nav className="flex items-center space-x-4">
          {navIcons.map((navItem) => (
            <button
              key={navItem.path}
              onClick={
                navItem.onClick || (() => (window.location.href = navItem.path))
              }
              className="hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={navItem.label}
            >
              {navItem.icon}
            </button>
          ))}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              onClick={toggleProfileDropdown}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
              aria-label="Profile menu"
            >
              <img
                src="/profile.jpg"
                alt="User profile"
                className="h-8 w-8 rounded-full border-2 border-gray-400 hover:border-white transition-colors object-cover"
                onError={handleImageError}
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-50"
                role="menu"
              >
                <div className="py-1">
                  {profileMenuItems.map((item, index) => (
                    <div key={index} role="none">
                      {renderDropdownItem(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <NotificationBar
        notificationRef={notificationRef}
        isNotificationOpen={isNotificationOpen}
        toggleNotification={toggleNotification}
        notifications={notifications}
      />

      <MessageSidebar
        sidebarRef={messageSidebarRef}
        isSidebarOpen={isMessageSidebarOpen}
        toggleSidebar={toggleMessageSidebar}
        messages={messages}
        currentUser={user?.username || "You"}
        conversations={conversations}
        onNewConversation={() => {
          // Handle new conversation logic
        }}
      />

      <InfoSideBar
        infoSidebarRef={infoSidebarRef as React.RefObject<HTMLDivElement>}
        isInfoSidebarOpen={isInfoSidebarOpen}
        toggleInfoSidebar={toggleInfoSidebar}
      />
    </>
  );
};

export default Header;