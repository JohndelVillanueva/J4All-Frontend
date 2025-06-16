import React from "react";
import { JobListing } from "../types/types";
import JobListItem from "./JobListItem";
import { FaBriefcase } from "react-icons/fa";

interface SavedJobsTabProps {
  jobListings: JobListing[];
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = ({ jobListings }) => {
  const savedJobs = jobListings.filter((job) => job.status === "saved");

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Jobs</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Jobs You've Saved for Later
          </h3>
        </div>
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {savedJobs.map((job) => (
              <li key={job.id}>
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
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Apply Now
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsTab;