import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface InfoSideBarProps {
    infoSidebarRef?: React.RefObject<HTMLDivElement>; // Make it optional
    isInfoSidebarOpen: boolean;
    toggleInfoSidebar: () => void;
  }

const InfoSideBar: React.FC<InfoSideBarProps> = ({
  infoSidebarRef,
  isInfoSidebarOpen,
  toggleInfoSidebar
}) => {
  return ( 
    <div 
      ref={infoSidebarRef}
      className={`fixed top-0 right-0 h-full w-80 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${isInfoSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ marginTop: '64px' }} // Adjust this to match your header height
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">System Information</h2>
          <button 
            onClick={toggleInfoSidebar}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">About J4IPWDs</h3>
            <p className="text-gray-300 text-sm">
              J4IPWDs is a comprehensive platform designed to provide seamless integration 
              of various services with a focus on user experience and accessibility.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">System Details</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><strong>Version:</strong> 2.3.1</li>
              <li><strong>Last Updated:</strong> June 15, 2023</li>
              <li><strong>License:</strong> Proprietary</li>
              <li><strong>Environment:</strong> Production</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Technical Specifications</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS</li>
              <li><strong>Backend:</strong> Node.js, Prisma</li>
              <li><strong>Database:</strong> MongoDB</li>
              <li><strong>Authentication:</strong> JWT</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
            <p className="text-gray-300 text-sm mb-2">
              For any technical issues or questions, please contact our support team.
            </p>
            <a 
              href="mailto:support@j4ipwds.example.com" 
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              support@j4ipwds.example.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-gray-400 text-xs text-center">
            © {new Date().getFullYear()} J4IPWDs. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
 
export default InfoSideBar;