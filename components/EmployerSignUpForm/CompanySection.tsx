import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FaBuilding, 
  FaUserTie, 
  FaBriefcase, 
  FaUser, 
  FaGlobe, 
  FaCalendarAlt, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

const CompanySection = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
        Company Information
      </h3>

      {/* Company Name */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBuilding className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Acme Inc."
            {...register("companyName", { required: "Company name is required" })}
          />
        </div>
        {typeof errors.companyName?.message === "string" && (
          <p className="text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      {/* Contact Person */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Contact Person
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUserTie className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Jane Smith"
            {...register("contactPerson")}
          />
        </div>
      </div>

      {/* Industry */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBriefcase className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Technology"
            {...register("industry")}
          />
        </div>
      </div>

      {/* Company Size */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Company Size
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
            {...register("companySize", { required: "Please select company size" })}
          >
            <option value="">Select Company Size</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="501+">501+</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {typeof errors.companySize?.message === "string" && (
          <p className="text-sm text-red-600">{errors.companySize.message}</p>
        )}
      </div>

      {/* Website URL */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Website URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaGlobe className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="url"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://yourcompany.com"
            {...register("websiteUrl")}
          />
        </div>
      </div>

      {/* Founded Year */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Founded Year
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="2020"
            {...register("foundedYear")}
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="123 Main St, City, Country"
            {...register("address")}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanySection;