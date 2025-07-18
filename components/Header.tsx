import React from "react";
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
import UserAvatar from "./UserAvatar";
import ApplicationDetailsModal from "../pages/applicant/ApplicationDetailsModal";
import { getFullPhotoUrl } from './utils/photo';
import { ChatContext } from "../contexts/ChatContext";
import EditJobSeekerAccountModal from '../pages/profile/EditJobSeekerAccountModal';
import { Link } from 'react-router-dom';
import { FaUser, FaIdBadge, FaUserGraduate, FaBuilding } from 'react-icons/fa';
import JobSeekerProfileModal from '../pages/profile/JobSeekerProfileModal';
import EmployerProfileModal from '../pages/profile/EmployerProfileModal';
import EditEmployerAccountModal from '../pages/profile/EditEmployerAccountModal';

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

// Add prop type
interface HeaderProps {
  onEmployerEditAccount?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEmployerEditAccount }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageSidebarOpen, setIsMessageSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editEmployerAccountOpen, setEditEmployerAccountOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const infoSidebarRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const messageSidebarRef = useRef<HTMLDivElement>(null);

  const HeaderStyle = "J4IPWDs";
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
              <FaInfoCircle />, 
        // Set targetUrl for application notifications if application_id exists
        targetUrl:
          (notification.application_id ? `/applications/${notification.application_id}` :
            (notification.type === 'info') ? '/info' : null),
        is_read: notification.is_read, // Preserve is_read from API
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

  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      // Transform service data to match component expectations
      const transformedConversations = data.map(conversation => ({
        id: conversation.id,
        participant: conversation.other_user
          ? (conversation.other_user.first_name && conversation.other_user.last_name
              ? `${conversation.other_user.first_name} ${conversation.other_user.last_name}`
              : conversation.other_user.username)
          : "Unknown",
        lastMessage: conversation.last_message?.content || 'No messages yet',
        time: conversation.last_message
          ? new Date(conversation.last_message.created_at).toLocaleTimeString()
          : new Date(conversation.updated_at).toLocaleTimeString(),
        unreadCount: conversation.unread_count || 0,
        photo: conversation.other_user ? conversation.other_user.photo || null : null,
        first_name: conversation.other_user ? conversation.other_user.first_name : null,
        last_name: conversation.other_user ? conversation.other_user.last_name : null,
      }));
      setConversations(transformedConversations);
      setConversationsLoaded(true);
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

  const handleLogout = useCallback(() => {
    setOpenConversations([]);
    localStorage.removeItem('openConversations');
    logout();
    navigate('/');
  }, [logout, navigate]);

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
      { icon: <FaUserCircle />, label: "Profile", path: "#", onClick: () => setProfileModalOpen(true) },
      { icon: <FaUserEdit />, label: "Edit Account", path: "#", onClick: () => {
    if (user && user.user_type === "employer" && onEmployerEditAccount) {
      onEmployerEditAccount();
    } else {
      setEditAccountOpen(true);
    }
  } },
      { icon: <FaCog />, label: "Settings", path: "/settings" },
      {
        icon: <FaSignOutAlt />,
        label: "Logout",
        path: "#",
        className: "text-red-400",
        onClick: handleLogout,
      },
    ],
    [handleLogout, user?.user_type, onEmployerEditAccount]
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

  // Set initial state from localStorage
  const [openConversations, setOpenConversations] = useState<{ id: number; minimized: boolean }[]>(() => {
    const saved = localStorage.getItem('openConversations');
    const parsed = saved ? JSON.parse(saved) : [];
    console.log('Loading openConversations from localStorage:', parsed);
    return parsed;
  });

  const initialLoadRef = useRef(true);
  const hasSyncedRef = useRef(false);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('openConversations state changed:', openConversations);
  }, [openConversations]);

  // Debug effect to log conversations loading
  useEffect(() => {
    console.log('conversations loaded:', conversations);
  }, [conversations]);

  // --- Comment out the sync effect for now ---
  // useEffect(() => {
  //   // Only run sync after both localStorage and conversations are loaded, and only once per load
  //   if (
  //     !conversationsLoaded ||
  //     conversations.length === 0 ||
  //     initialLoadRef.current ||
  //     hasSyncedRef.current
  //   )
  //     return;
  //   console.log('Syncing openConversations with conversations:', conversations, openConversations);
  //   setOpenConversations((prev) =>
  //     prev.filter((c) => conversations.some((conv) => conv.id === c.id))
  //   );
  //   hasSyncedRef.current = true;
  // }, [conversations, conversationsLoaded]);

  // Update handlers
  const handleConversationClick = useCallback((conversationId: number) => {
    if (!conversations.some((c) => c.id === conversationId)) return;
    setOpenConversations((prev) => {
      if (prev.some((c) => c.id === conversationId)) return prev;
      return [
        ...prev,
        {
          id: conversationId,
          minimized: false,
        },
      ];
    });
  }, [conversations]);
  const handleMinimize = (id: number) => {
    setOpenConversations((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, minimized: true } : c));
      console.log('Minimizing conversation. New openConversations:', updated);
      return updated;
    });
  };
  const handleRestore = (id: number) => {
    setOpenConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, minimized: false } : c))
    );
  };
  const handleClose = (id: number) => {
    setOpenConversations((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('openConversations', JSON.stringify(openConversations));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [openConversations]);

  // Add state for user photo
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  // Fetch user photo on mount or when user changes
  useEffect(() => {
    console.log('Header user object:', user); // Debug log
    const fetchUserPhoto = async () => {
      if (!user?.id) {
        setUserPhotoUrl(null);
        return;
      }
      console.log('Calling fetchUserPhoto for user id:', user.id); // Debug log
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/photos/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user photo");
        const data = await res.json();
        console.log('Fetched user photo URL:', data?.data?.photo_url); // Debug log
        setUserPhotoUrl(data?.data?.photo_url || null);
      } catch (err) {
        console.error('Error fetching user photo:', err); // Debug log
        setUserPhotoUrl(null);
      }
    };
    fetchUserPhoto();
  }, [user?.id]);

  // Optimistic mark as read handler
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadNotificationCount((prev) => Math.max(prev - 1, 0));
      // Refetch for accuracy
      fetchUnreadNotificationCount();
      fetchNotifications(); // Ensure notifications are always in sync with backend
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // If notification is for an application (targetUrl matches /applications/ID)
    const match = notification.targetUrl && notification.targetUrl.match(/\/applications\/(\d+)/);
    if (match) {
      setSelectedApplicationId(Number(match[1]));
      setIsApplicationModalOpen(true);
      if (handleMarkAsRead) await handleMarkAsRead(notification.id);
      return;
    }
    // Default: navigate
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
      if (handleMarkAsRead) await handleMarkAsRead(notification.id);
      toggleNotification();
    }
  };

  // Don't render header if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <ChatContext.Provider value={{ openConversation: handleConversationClick }}>
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
          {navIcons.map((navItem, idx) => (
            <button
              key={navItem.label || idx}
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
              {/* Use UserAvatar for consistent fallback and styling */}
              <UserAvatar
                photoUrl={getFullPhotoUrl(userPhotoUrl)}
                firstName={user?.first_name}
                lastName={user?.last_name}
                size="sm"
              />
              {/* Debug: Show photo URL or error message */}
              {userPhotoUrl === null && (
                <span style={{ color: 'red', fontSize: 10, marginLeft: 4 }}>
                  (No photo found or failed to load)
                </span>
              )}
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
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={async () => {
          try {
            await notificationService.markAllAsRead();
            fetchNotifications();
            fetchUnreadNotificationCount();
          } catch (error) {
            console.error('Error marking all notifications as read:', error);
          }
        }}
        onNotificationClick={handleNotificationClick}
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

      {/* Render open (not minimized) MessageViews */}
      {(() => {
        const openNotMinimized = openConversations.filter(c => !c.minimized);
        const totalOpen = openNotMinimized.length;
        return openNotMinimized.map((c, idx) => {
          const conv = conversations.find(conv => conv.id === c.id);
          if (!conv) return null;
          // Stack to the right: right offset decreases as idx increases
          return (
            <MessageView
              key={c.id}
              conversationId={c.id}
              onClose={() => handleClose(c.id)}
              onBack={() => handleClose(c.id)}
              currentUserId={Number(user?.id) || 0}
              onMessagesRead={() => {
                fetchConversations();
                fetchUnreadMessageCount();
              }}
              isMinimized={false}
              onMinimize={() => handleMinimize(c.id)}
              style={{
                position: 'fixed',
                bottom: 8,
                right: 100 + (totalOpen - idx - 1) * 370,
                zIndex: 1000 + idx,
                width: 350,
                maxWidth: '100%',
                height: 540,
              }}
            />
          );
        });
      })()}

      {/* Render minimized floating icons only for minimized conversations */}
      {(() => {
        const minimized = openConversations.filter(c => c.minimized);
        const total = minimized.length;
        return minimized.map((c, idx) => {
          const conv = conversations.find(conv => conv.id === c.id);
          if (!conv) return null;
          return (
            <div
              key={c.id}
              style={{
                position: 'fixed',
                bottom: 24 + ((total - idx - 1) * 80),
                right: 24,
                zIndex: 1000 + idx,
              }}
            >
              {/* Close button */}
              <button
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  background: 'white', // or 'transparent' for no background
                  color: 'gray',
                  borderRadius: '50%',
                  fontSize: 12,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 1001,
                }}
                onClick={e => {
                  e.stopPropagation();
                  handleClose(c.id);
                }}
                title="Close chat"
              >
                ×
              </button>
              {/* Main chat button */}
              <button
                style={{
                  width: 64,
                  height: 64,
                  background: 'transparent',
                  color: 'inherit',
                  borderRadius: '50%',
                  fontSize: 24,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                onClick={() => handleRestore(c.id)}
                title={`Restore chat with ${conv.participant}`}
              >
                <img
                  src={getFullPhotoUrl(conv.photo ?? undefined)}
                  alt={conv.participant}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          );
        });
      })()}

      <ApplicationDetailsModal
        applicationId={selectedApplicationId}
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedApplicationId(null);
          fetchNotifications();
          fetchUnreadNotificationCount();
        }}
      />
      {user && ["pwd", "indigenous", "general"].includes(user.user_type) && (
        <EditJobSeekerAccountModal isOpen={editAccountOpen} onClose={() => setEditAccountOpen(false)} />
      )}
      {user && user.user_type === "employer" && (
        <EditEmployerAccountModal isOpen={editEmployerAccountOpen} onClose={() => setEditEmployerAccountOpen(false)} />
      )}
      {/* Profile Modal */}
      {profileModalOpen && user && ["pwd", "indigenous", "general"].includes(user.user_type) && (
        <JobSeekerProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onEditProfile={() => {
            setProfileModalOpen(false);
            setTimeout(() => setEditAccountOpen(true), 200);
          }}
        />
      )}
      {profileModalOpen && user && user.user_type === "employer" && (
        <EmployerProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onEditProfile={() => {
            setProfileModalOpen(false);
            setTimeout(() => setEditEmployerAccountOpen(true), 200);
          }}
        />
      )}
    </ChatContext.Provider>
  );
};

export default Header;