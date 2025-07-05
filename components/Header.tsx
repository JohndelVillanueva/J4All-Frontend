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
import MessageView from "./MessageView";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserType, MenuItem } from "../components/types/types";
import { notificationService } from "../src/services/notificationService";
import { messageService } from "../src/services/messageService";
import React from "react";

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageSidebarOpen, setIsMessageSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const infoSidebarRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messageSidebarRef = useRef<HTMLDivElement>(null);

  const HeaderStyle = "J4All";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Real notifications data
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      // Transform service data to match component expectations
      const transformedNotifications = data.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: new Date(notification.created_at).toLocaleTimeString(),
        icon: notification.type === 'error' ? <FaExclamationTriangle /> : 
              notification.type === 'success' ? <FaCheckCircle /> : 
              <FaInfoCircle />
      }));
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Fetch unread notification count
  const fetchUnreadNotificationCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadNotificationCount();
  }, [fetchNotifications, fetchUnreadNotificationCount]);
  // Real conversations data
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      // Transform service data to match component expectations
      const transformedConversations = data.map(conversation => ({
        id: conversation.id,
        participant: conversation.other_user.first_name && conversation.other_user.last_name 
          ? `${conversation.other_user.first_name} ${conversation.other_user.last_name}`
          : conversation.other_user.username,
        lastMessage: conversation.last_message?.content || 'No messages yet',
        time: conversation.last_message 
          ? new Date(conversation.last_message.created_at).toLocaleTimeString()
          : new Date(conversation.updated_at).toLocaleTimeString(),
        unreadCount: conversation.unread_count || 0,
        avatar: undefined
      }));
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch unread message count
  const fetchUnreadMessageCount = useCallback(async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadMessageCount(count);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  }, []);

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations();
    fetchUnreadMessageCount();
  }, [fetchConversations, fetchUnreadMessageCount]);
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

  const handleConversationClick = useCallback((conversationId: number) => {
    setSelectedConversationId(conversationId);
  }, []);

  const handleMessageViewBack = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const handleMessageViewClose = useCallback(() => {
    setSelectedConversationId(null);
    setIsMessageSidebarOpen(false);
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
    setSelectedConversationId(null);
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
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {unreadMessageCount}
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
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {unreadNotificationCount}
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
      unreadNotificationCount,
      unreadMessageCount,
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
        onMarkAsRead={async (notificationId) => {
          try {
            await notificationService.markAsRead(notificationId);
            fetchNotifications();
            fetchUnreadNotificationCount();
          } catch (error) {
            console.error('Error marking notification as read:', error);
          }
        }}
        onMarkAllAsRead={async () => {
          try {
            await notificationService.markAllAsRead();
            fetchNotifications();
            fetchUnreadNotificationCount();
          } catch (error) {
            console.error('Error marking all notifications as read:', error);
          }
        }}
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
        onRefreshConversations={fetchConversations}
        onRefreshUnreadCount={fetchUnreadMessageCount}
        onConversationClick={handleConversationClick}
      />

      <InfoSideBar
        infoSidebarRef={infoSidebarRef as React.RefObject<HTMLDivElement>}
        isInfoSidebarOpen={isInfoSidebarOpen}
        toggleInfoSidebar={toggleInfoSidebar}
      />

      {selectedConversationId && (
        <MessageView
          conversationId={selectedConversationId}
          onClose={handleMessageViewClose}
          onBack={handleMessageViewBack}
          currentUserId={Number(user?.id) || 0}
          onMessagesRead={() => {
            // Refresh conversations and unread counts when messages are read
            fetchConversations();
            fetchUnreadMessageCount();
          }}
        />
      )}
    </>
  );
};

export default Header;