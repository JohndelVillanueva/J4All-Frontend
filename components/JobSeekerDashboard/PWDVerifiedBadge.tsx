import React from "react";
import { FaCheckCircle } from "react-icons/fa";

interface PWDVerifiedBadgeProps {
  isVisible: boolean;
  completionPercentage: number;
}

const PWDVerifiedBadge: React.FC<PWDVerifiedBadgeProps> = ({
  isVisible,
  completionPercentage,
}) => {
  if (!isVisible || completionPercentage < 100) return null;

  return (
    <div className="fixed top-20 right-6 z-50 w-80 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Accent bar with animated gradient */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400"></div>
        
        <div className="p-5">
          <div className="flex items-start">
            {/* Verified icon with pulse animation */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <FaCheckCircle className="h-7 w-7 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="ml-4 flex-1">
              {/* Verified status */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Profile Verified!
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  100%
                </span>
              </div>

              {/* Success message */}
              <p className="text-sm text-gray-700 mb-3">
                Your PWD profile is complete and verified. You now have full access to all features!
              </p>

              {/* Features unlocked */}
              <div className="bg-white/60 rounded-lg p-3 mb-3 border border-green-200">
                <p className="text-xs font-semibold text-green-800 mb-2">✨ Verified Benefits:</p>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                    Priority job matching
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                    Enhanced profile visibility
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                    Verified badge on applications
                  </li>
                </ul>
              </div>

              {/* Verification badge indicator */}
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                <FaCheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-800">
                  PWD Verified Profile
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWDVerifiedBadge;