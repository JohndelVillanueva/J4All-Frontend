import React, { useState } from "react";
import { FaTimes, FaPaperPlane, FaUserCircle } from "react-icons/fa";
import { messageService } from "../../src/services/messageService";
import { useToast } from "../ToastContainer";
import { handleApiError } from "../../src/utils/errorHandler";

interface Applicant {
  id: number;
  name: string;
  position: string;
  experience: string;
  applied: string;
  skills: string[];
  status: string;
  user_id: number; // Job seeker's user ID
}

interface EmployerMessageModalProps {
  applicant: Applicant;
  onClose: () => void;
  onSendMessage?: () => void;
}

const EmployerMessageModal: React.FC<EmployerMessageModalProps> = ({ 
  applicant, 
  onClose, 
  onSendMessage 
}) => {
  console.log("Modal rendered");
  console.log("Modal props", applicant);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting message to job seeker:", message, applicant.user_id);
    if (!message.trim()) {
      const errorMessage = "Please enter a message";
      setError(errorMessage);
      showToast({
        type: 'warning',
        title: 'Message Required',
        message: errorMessage,
        autoHide: true,
        autoHideDelay: 3000
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to send messages");
      }

      console.log('Creating conversation with job seeker user_id:', applicant.user_id);

      // First, create or get conversation with the job seeker
      const conversationResponse = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          participant2_id: applicant.user_id // The job seeker's user ID
        })
      });

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json();
        console.error('Conversation creation failed:', errorData);
        
        // Create a mock error object for the error handler
        const mockError = {
          response: {
            status: conversationResponse.status,
            data: errorData
          }
        };
        
        const errorInfo = handleApiError(mockError);
        showToast(errorInfo);
        setError(errorInfo.message);
        return;
      }

      const conversationData = await conversationResponse.json();
      console.log('Conversation created:', conversationData);
      const conversationId = conversationData.data.id;

      // Send the message
      const messageResponse = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          receiver_id: applicant.user_id,
          content: message
        })
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json();
        
        // Create a mock error object for the error handler
        const mockError = {
          response: {
            status: messageResponse.status,
            data: errorData
          }
        };
        
        const errorInfo = handleApiError(mockError);
        showToast(errorInfo);
        setError(errorInfo.message);
        return;
      }

      setSuccess(true);
      setMessage("");
      
      showToast({
        type: 'success',
        title: 'Message Sent',
        message: 'Your message has been sent successfully!',
        autoHide: true,
        autoHideDelay: 3000
      });
      
      if (onSendMessage) {
        onSendMessage();
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo);
      setError(errorInfo.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Message {applicant.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
            Message sent successfully!
          </div>
        )}

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center mb-2">
            <FaUserCircle className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{applicant.name}</p>
              <p className="text-xs text-gray-500">{applicant.position}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Experience:</strong> {applicant.experience}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Applied:</strong> {applicant.applied}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {applicant.status}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              className={`w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none ${isSubmitting ? 'opacity-50' : ''}`}
              rows={4}
              placeholder="Write your message to the applicant..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${isSubmitting ? 'opacity-50' : ''}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center ${isSubmitting ? 'opacity-50' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployerMessageModal; 