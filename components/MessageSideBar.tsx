import React, { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaUserCircle, FaEllipsisV } from "react-icons/fa";
import UserAvatar from "./UserAvatar";
import { getFullPhotoUrl } from "../components/utils/photo";

// API Conversation Interface
// interface ApiConversation {
//   id: number;
//   other_user: {
//     id: number;
//     username: string;
//     first_name: string | null;
//     last_name: string | null;
//     photo: string | null;
//   };
//   last_message: {
//     content: string;
//     created_at: string;
//   } | null;
//   unread_count: number;
//   updated_at: string;
// }

// // Helper function to convert API conversation to sidebar format
// const convertConversation = (apiConv: ApiConversation) => ({
//   id: apiConv.id,
//   participant: apiConv.other_user.first_name && apiConv.other_user.last_name 
//     ? `${apiConv.other_user.first_name} ${apiConv.other_user.last_name}`
//     : apiConv.other_user.username,
//   lastMessage: apiConv.last_message?.content || 'No messages yet',
//   time: new Date(apiConv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//   unreadCount: apiConv.unread_count,
//   photo: apiConv.other_user.photo,
//   first_name: apiConv.other_user.first_name,
//   last_name: apiConv.other_user.last_name
// });

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
  const [localConversations, setLocalConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  React.useEffect(() => {
    console.log("=== MESSAGE SIDEBAR DEBUG ===");
    console.log("isSidebarOpen:", isSidebarOpen);
    console.log("conversations from props:", conversations);
    console.log("conversations length:", conversations?.length);
    console.log("=== END DEBUG ===");
  }, [isSidebarOpen, conversations]);

  // Use mock data if no conversations from props (for testing)
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      setLocalConversations(conversations);
      setIsLoading(false);
    } else {
      // Temporary mock data for testing UI
      const mockConversations: Conversation[] = [
        {
          id: 1,
          participant: "John Doe",
          lastMessage: "Hey, how are you doing?",
          time: "2:30 PM",
          unreadCount: 2,
          first_name: "John",
          last_name: "Doe"
        },
        {
          id: 2,
          participant: "Jane Smith",
          lastMessage: "Thanks for your help!",
          time: "1:15 PM",
          unreadCount: 0,
          first_name: "Jane",
          last_name: "Smith"
        },
        {
          id: 3,
          participant: "Mike Johnson",
          lastMessage: "See you tomorrow",
          time: "12:45 PM",
          unreadCount: 1,
          first_name: "Mike",
          last_name: "Johnson"
        }
      ];
      
      setTimeout(() => {
        setLocalConversations(mockConversations);
        setIsLoading(false);
        console.log("Using mock conversations data");
      }, 1000);
    }
  }, [conversations]);

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
  const totalUnreadCount = localConversations?.reduce((total, conv) => total + (conv.unreadCount || 0), 0) || 0;

  return (
    <div 
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
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
          <div className="text-xs text-gray-500 mt-1">
            {isLoading ? "Loading..." : `${localConversations.length} conversations loaded`}
            {conversations?.length === 0 && " (Using mock data - API issue)"}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm">Loading conversations...</p>
            </div>
          ) : localConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p className="text-sm">No conversations found</p>
              <p className="text-xs mt-1">Start a new conversation to see it here</p>
              <div className="text-xs mt-2 p-2 bg-yellow-50 rounded text-center">
                API Connection Issue<br/>
                Check browser console for details
              </div>
            </div>
          ) : (
            localConversations.map(conversation => (
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSidebar;