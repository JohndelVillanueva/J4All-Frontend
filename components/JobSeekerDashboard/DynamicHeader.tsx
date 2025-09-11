import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ApplicantHeaderProps } from "../types/types";

const DynamicHeader: React.FC<ApplicantHeaderProps> = ({
  // title = "DevCareer Dashboard",
  user,
  showSearch = true,
  onSearchChange,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <header className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.firstName && (
              <p className="font-semibold text-gray-500">
                Hello, {user.firstName} {user.lastName}
              </p>
            )}
          </h1>
        </div>
        {/* {showSearch && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        )} */}
      </div>
    </header>
  );
};

export default DynamicHeader;