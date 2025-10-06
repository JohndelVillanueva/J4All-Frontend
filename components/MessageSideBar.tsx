import React from "react";
import { FaTimes, FaSearch, FaUserCircle, FaEllipsisV } from "react-icons/fa";
import UserAvatar from "./UserAvatar";
import { getFullPhotoUrl } from "../components/utils/photo";

interface Conversation {
  id: number;
  participant: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  photo?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export type MessageSidebarProps = {
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  messages: {
    id: number;
    sender: string;
    text: string;
    time: string;
    isCurrentUser: boolean;
  }[];
  conversations: Conversation[];
  currentUser: string;
  onNewConversation: () => void;
  onRefreshConversations?: () => Promise<void>;
  onRefreshUnreadCount?: () => Promise<void>;
  onConversationClick?: (conversationId: number) => void;
};

const MessageSidebar: React.FC<MessageSidebarProps> = ({ 
  sidebarRef, 
  isSidebarOpen, 
  toggleSidebar, 
  conversations,
  onConversationClick
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log("MessageSidebar Debug:", {
      isSidebarOpen,
      conversationsCount: conversations?.length,
      conversations: conversations,
      onConversationClick: typeof onConversationClick
    });
  }, [isSidebarOpen, conversations, onConversationClick]);

  // Handle conversation click with error handling
  const handleConversationClick = (conversationId: number) => {
    console.log("Conversation clicked:", conversationId);
    try {
      onConversationClick?.(conversationId);
    } catch (error) {
      console.error("Error in conversation click handler:", error);
    }
  };

  // Calculate total unread count safely
  const totalUnreadCount = conversations?.reduce((total, conv) => total + (conv.unreadCount || 0), 0) || 0;

  return (
    <div 
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ border: isSidebarOpen ? '2px solid blue' : 'none' }} // Debug border
    >
      <div className="h-full flex flex-col border-l border-gray-200">
        {/* Main Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FaUserCircle className="text-gray-600 text-xl mr-2" />
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-500 hover:text-gray-700">
              <FaSearch />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <FaEllipsisV />
            </button>
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Conversations Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-600">Recent Conversations</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {totalUnreadCount} unread
            </span>
          </div>
          {/* Debug info - remove in production */}
          <div className="text-xs text-gray-500 mt-1">
            {conversations?.length || 0} conversations loaded
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {!conversations || conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p className="text-sm">No conversations found</p>
              <p className="text-xs mt-1">Start a new conversation to see it here</p>
              <div className="text-xs mt-2 p-2 bg-yellow-50 rounded">
                Debug: Check if conversations data is being passed correctly
              </div>
            </div>
          ) : (
            conversations.map(conversation => (
              <div 
                key={conversation.id} 
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <UserAvatar
                      photoUrl={getFullPhotoUrl(conversation.photo ?? undefined)}
                      firstName={conversation.first_name}
                      lastName={conversation.last_name}
                      size="md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participant || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {conversation.time || 'Unknown time'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500 truncate flex-1 mr-2">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex-shrink-0">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Debug info - remove in production */}
                <div className="text-xs text-gray-400 mt-1">
                  ID: {conversation.id} | Unread: {conversation.unreadCount || 0}
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Conversation Button */}
        {/* <div className="p-4 border-t border-gray-200">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            New Conversation
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default MessageSidebar;