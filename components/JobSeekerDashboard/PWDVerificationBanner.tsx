import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface PWDVerificationBannerProps {
  isVisible: boolean;
  onVerifyClick: () => void;
  onDismiss: () => void;
  completionPercentage?: number;
}

const PWDVerificationBanner: React.FC<PWDVerificationBannerProps> = ({
  isVisible,
  onVerifyClick,
  onDismiss,
  completionPercentage = 0,
}) => {
  if (!isVisible) return null;

  // Determine color based on completion percentage
  const getProgressColor = () => {
    if (completionPercentage >= 80) return 'from-green-400 to-emerald-500';
    if (completionPercentage >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-orange-500';
  };

  const getTextColor = () => {
    if (completionPercentage >= 80) return 'text-green-600';
    if (completionPercentage >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="fixed top-20 right-6 z-50 w-96 animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
        
        <div className="p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <FaExclamationTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900">
                  Complete Your PWD Verification
                </h3>
              </div>

              {/* Profile Completion Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">Profile Completion</span>
                  <span className={`text-xs font-bold ${getTextColor()}`}>
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                <p className="mb-2">
                  Verify your account to unlock all features and improve job matching.
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                    <span>PWD ID Number</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Disability Information</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onVerifyClick}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all transform hover:scale-105"
                >
                  Verify Now
                </button>
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWDVerificationBanner;