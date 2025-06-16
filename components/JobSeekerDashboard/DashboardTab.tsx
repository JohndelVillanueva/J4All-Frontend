import React from "react";
import { FaChartLine, FaBriefcase, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";
import { Application, JobListing, StatItem } from "../types/types";

interface DashboardTabProps {
  stats: StatItem[];
  jobListings: JobListing[];
  applications: Application[];
}

const DashboardTab: React.FC<DashboardTabProps> = ({ stats, jobListings, applications }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Job Search Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Recommended Jobs */}
      <JobListingsSection 
        title="Recommended Jobs For You" 
        jobs={jobListings.slice(0, 3)} 
        className="mb-8" 
      />

      {/* Recent Activity */}
      <ApplicationsSection 
        title="Recent Activity" 
        applications={applications} 
        jobListings={jobListings} 
      />
    </div>
  );
};

const StatCard: React.FC<{ stat: StatItem }> = ({ stat }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
          <FaChartLine className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
            <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {stat.change}
            </div>
          </dd>
        </div>
      </div>
    </div>
  </div>
);

const JobListingsSection: React.FC<{ 
  title: string; 
  jobs: JobListing[]; 
  className?: string 
}> = ({ title, jobs, className }) => (
  <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="bg-white overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <JobListItem key={job.id} job={job} />
        ))}
      </ul>
    </div>
  </div>
);

const JobListItem: React.FC<{ job: JobListing }> = ({ job }) => (
  <li>
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-lg font-medium">{job.company.charAt(0)}</span>
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
            <span key={i} className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
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

const ApplicationsSection: React.FC<{ 
  title: string; 
  applications: Application[]; 
  jobListings: JobListing[] 
}> = ({ title, applications, jobListings }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="bg-white overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {applications.map((app) => {
          const job = jobListings.find((j) => j.id === app.jobId) || jobListings[0];
          return <ApplicationListItem key={app.id} application={app} job={job} />;
        })}
      </ul>
    </div>
  </div>
);

const ApplicationListItem: React.FC<{ 
  application: Application; 
  job: JobListing 
}> = ({ application, job }) => (
  <li>
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="text-sm font-medium text-blue-600">
            {job.title} at {job.company}
          </p>
          <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
            Applied on {application.date}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0 flex">
          {application.status === "under review" && (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              Under Review
            </span>
          )}
          {application.status === "interview" && (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Interview Stage
            </span>
          )}
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar status={application.status} />
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Updates:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {application.updates.map((update, i) => (
              <li key={i} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  {update.date}: {update.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </li>
);

const ProgressBar: React.FC<{ status: "under review" | "interview" }> = ({ status }) => (
  <div className="flex items-center text-sm text-gray-500">
    <div className="relative pt-1 w-full">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span
            className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
              status === "interview" ? "text-yellow-600 bg-yellow-200" : "text-blue-600 bg-blue-200"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block">
            {status === "interview" ? "75%" : "40%"} complete
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{ width: `${status === "interview" ? "75%" : "40%"}` }}
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
            status === "interview" ? "bg-yellow-500" : "bg-blue-500"
          }`}
        ></div>
      </div>
    </div>
  </div>
);

export default DashboardTab;