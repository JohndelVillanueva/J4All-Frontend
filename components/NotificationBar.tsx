import { FaBell, FaTimes } from "react-icons/fa";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
}

interface NotificationBarProps {
  notificationRef?: React.RefObject<HTMLDivElement | null>;
  isNotificationOpen: boolean;
  toggleNotification: () => void;
  notifications: Notification[];
}

const NotificationBar: React.FC<NotificationBarProps> = ({ 
  notificationRef, 
  isNotificationOpen, 
  toggleNotification, 
  notifications 
}) => {
  
  return (
    <div 
      ref={notificationRef}
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
        isNotificationOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col border-l border-gray-200">
        {/* Main Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/Images/logo1.jpg"
              alt="Company Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          <button 
            onClick={toggleNotification}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close notifications"
          >
            <FaTimes />
          </button>
        </div>

        {/* Notification Controls */}
        <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {notifications.length} New Notifications
          </span>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => {
              // Mark all as read functionality
            }}
          >
            Mark all as read
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li key={notification.id} className="hover:bg-gray-50 transition-colors">
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'alert' ? 'bg-yellow-100 text-yellow-600' : 
                        notification.type === 'success' ? 'bg-green-100 text-green-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-md font-semibold text-gray-800">{notification.title}</h3>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <FaBell className="text-gray-300 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-500">No notifications</h3>
              <p className="text-gray-400 text-sm mt-1">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
          <button 
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            onClick={toggleNotification}
          >
            Close notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;