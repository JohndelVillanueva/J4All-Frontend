import React from "react";
import { FaBriefcase } from "react-icons/fa";
import { JobListing } from "../types/types";

interface JobListItemProps {
  job: JobListing;
}

const JobListItem: React.FC<JobListItemProps> = ({ job }) => {
  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-lg font-medium">
                {job.company.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-blue-600">{job.title}</p>
              <p className="text-sm text-gray-500">
                {job.company} • {job.location}
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex flex-col items-end">
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-2">
              {job.match}% Match
            </span>
            <span className="text-sm text-gray-500">{job.posted}</span>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <FaBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              {job.salary}
            </p>
            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
              {job.type}
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            {job.skills.map((skill, i) => (
              <span
                key={i}
                className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex space-x-3">
          {job.status === "new" ? (
            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Apply Now
            </button>
          ) : job.status === "applied" ? (
            <span className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100">
              Applied
            </span>
          ) : (
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save Job
            </button>
          )}
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            View Details
          </button>
        </div>
      </div>
    </li>
  );
};

export default JobListItem;