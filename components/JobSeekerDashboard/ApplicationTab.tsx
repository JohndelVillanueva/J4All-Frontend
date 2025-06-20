import React from "react";
import { FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";
import { Application, JobListing } from "../types/types";
import ErrorBoundary from "./ErrorBoundary"; // Import the ErrorBoundary component

interface ApplicationsTabProps {
  applications: Application[];
  jobListings: JobListing[];
}

const ApplicationListItem: React.FC<{ app: Application; job?: JobListing }> = ({ app, job }) => {
  // Fallback values for missing job data
  const safeJob = job || {
    id: 0,
    title: "Position no longer available",
    company: "Unknown Company",
    location: "",
    salary: "",
    type: "",
    posted: "",
    skills: [],
    status: "new",
    match: 0
  };

  // Ensure updates exists before mapping
  const updates = app.updates || [];

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-lg font-medium">
                {safeJob.company?.charAt(0) || "?"}
              </span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-blue-600">{safeJob.title}</p>
              <p className="text-sm text-gray-500">
                {safeJob.company} • Applied on {app.date || "unknown date"}
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            {app.status === "under review" && (
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                Under Review
              </span>
            )}
            {app.status === "interview" && (
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Interview Stage
              </span>
            )}
            {!app.status && (
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                Status Unknown
              </span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500">
            <div className="relative pt-1 w-full">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                      app.status === "interview"
                        ? "text-yellow-600 bg-yellow-200"
                        : "text-blue-600 bg-blue-200"
                    }`}
                  >
                    {app.status || "pending"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block">
                    {app.status === "interview" ? "75%" : "40%"} complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${app.status === "interview" ? "75%" : "40%"}`,
                  }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    app.status === "interview" ? "bg-yellow-500" : "bg-blue-500"
                  }`}
                ></div>
              </div>
            </div>
          </div>
          {updates.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Recent Updates:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {updates.slice(0, 3).map((update, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>
                      {update.date || "No date"}: {update.message || "No message"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FaEnvelope className="mr-2" />
            Message Recruiter
          </button>
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            View Job Posting
            <FaExternalLinkAlt className="ml-2" />
          </button>
        </div>
      </div>
    </li>
  );
};

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ applications, jobListings }) => {
  // Filter out null/undefined applications
  const validApplications = applications?.filter(app => app) || [];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Applications</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Track Your Application Progress
          </h3>
        </div>
        <div className="bg-white overflow-hidden">
          {validApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              You haven't applied to any jobs yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {validApplications.map((app) => {
                const job = jobListings.find((j) => j.id === app.jobId);
                return (
                  <ErrorBoundary 
                    key={app.id}
                    fallback={
                      <li className="p-4 bg-red-50 text-red-600">
                        Failed to render application #{app.id}
                      </li>
                    }
                  >
                    <ApplicationListItem app={app} job={job} />
                  </ErrorBoundary>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTab;