import React, { useState, useEffect } from "react";
import { FaTimes, FaArrowLeft, FaPaperPlane, FaUserCircle, FaWindowMinimize, FaComments } from "react-icons/fa";
import { messageService } from "../src/services/messageService";

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
  };
  receiver: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Conversation {
  id: number;
  other_user: {
    id: number;
    username: string;
    first_name: string | null;
    last_name: string | null;
  };
  last_message: Message | null;
  updated_at: string;
  unread_count: number;
}

interface MessageViewProps {
  conversationId: number | null;
  onClose: () => void;
  onBack: () => void;
  currentUserId: number;
  onMessagesRead?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({
  conversationId,
  onClose,
  onBack,
  currentUserId,
  onMessagesRead,
  isMinimized = false,
  onMinimize,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages and conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchConversation();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const messagesData = await messageService.getMessages(conversationId);
      setMessages(messagesData);
      // Call onMessagesRead callback to refresh unread counts
      onMessagesRead?.();
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversation = async () => {
    if (!conversationId) return;
    try {
      const conversationData = await messageService.getConversation(conversationId);
      console.log("Fetched conversation data:", conversationData);
      setConversation(conversationData);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSendMessage triggered", { newMessage, conversationId, conversation });
    if (!newMessage.trim() || !conversationId || !conversation) return;

    setIsSending(true);
    try {
      const messageData = await messageService.sendMessage(conversationId, {
        receiver_id: conversation.other_user.id,
        content: newMessage.trim(),
      });
      console.log("Message sent, response:", messageData);
      setMessages(prev => [...prev, messageData]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderName = (message: Message) => {
    if (message.sender_id === currentUserId) {
      return "You";
    }
    return message.sender.first_name && message.sender.last_name
      ? `${message.sender.first_name} ${message.sender.last_name}`
      : message.sender.username;
  };

  const getOtherUserName = () => {
    if (!conversation) return "Unknown";
    return conversation.other_user.first_name && conversation.other_user.last_name
      ? `${conversation.other_user.first_name} ${conversation.other_user.last_name}`
      : conversation.other_user.username;
  };

  if (!conversationId || isMinimized) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 text-gray-500 hover:text-gray-700"
            >
              <FaArrowLeft />
            </button>
            <div className="flex items-center">
              <FaUserCircle className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">{getOtherUserName()}</h2>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMinimize}
              className="text-gray-500 hover:text-gray-700"
              title="Minimize"
            >
              <FaWindowMinimize />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">No messages yet. Start the conversation!</div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentUserId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {getSenderName(message)}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageView; 