import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaTimes,
  FaExclamationCircle 
} from 'react-icons/fa';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorMessageProps {
  type?: ErrorType;
  title?: string;
  message: string;
  onClose?: () => void;
  showIcon?: boolean;
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'error',
  title,
  message,
  onClose,
  showIcon = true,
  className = '',
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'warning':
        return <FaExclamationCircle className="w-5 h-5" />;
      case 'info':
        return <FaInfoCircle className="w-5 h-5" />;
      case 'success':
        return <FaCheckCircle className="w-5 h-5" />;
      default:
        return <FaExclamationTriangle className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-l-4 border-red-400 text-red-700',
          icon: 'text-red-400',
          closeButton: 'text-red-400 hover:text-red-600'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700',
          icon: 'text-yellow-400',
          closeButton: 'text-yellow-400 hover:text-yellow-600'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700',
          icon: 'text-blue-400',
          closeButton: 'text-blue-400 hover:text-blue-600'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-l-4 border-green-400 text-green-700',
          icon: 'text-green-400',
          closeButton: 'text-green-400 hover:text-green-600'
        };
      default:
        return {
          container: 'bg-red-50 border-l-4 border-red-400 text-red-700',
          icon: 'text-red-400',
          closeButton: 'text-red-400 hover:text-red-600'
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`p-4 ${styles.container} ${className}`}
        >
          <div className="flex items-start">
            {showIcon && (
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {getIcon()}
              </div>
            )}
            <div className="ml-3 flex-1">
              {title && (
                <h3 className="text-sm font-medium mb-1">
                  {title}
                </h3>
              )}
              <p className="text-sm">
                {message}
              </p>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <button
                  onClick={handleClose}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.closeButton}`}
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage; 