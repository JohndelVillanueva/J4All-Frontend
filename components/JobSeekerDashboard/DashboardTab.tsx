import React, { useEffect, useState } from "react";
import {
  FaChartLine,
  FaBriefcase,
  FaEnvelope,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Application, JobListing, StatItem } from "../types/types";
import JobDescriptionModal from "./JobDescriptionModal";
import ApplyModal from "./ApplyModal";
import UserAvatar from '../UserAvatar';
import { useToast } from "../ToastContainer"; // Add this import
import { handleJobApplicationError } from "../../src/utils/errorHandler"; // Add this import
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper hook to fetch employer photo and name
function useEmployerAvatarInfo(userId?: number) {
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');

  React.useEffect(() => {
    if (!userId) return;
    const fetchInfo = async () => {
      try {
        const userRes = await fetch(`/api/users/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setFirstName(userData?.data?.first_name || '');
          setLastName(userData?.data?.last_name || '');
        }
        const photoRes = await fetch(`/api/photos/${userId}`);
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setPhotoUrl(photoData?.data?.photo_url || null);
        }
      } catch (e) {
        setPhotoUrl(null);
      }
    };
    fetchInfo();
  }, [userId]);

  return { photoUrl, firstName, lastName };
}

interface DashboardTabProps {
  stats: StatItem[];
  jobListings: JobListing[];
  applications: Application[];
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  jobListings,
  applications,
  onJobStatusUpdate,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyJob, setApplyJob] = useState<JobListing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state
  const [error, setError] = useState<string | null>(null); // Add this state
  const { showToast } = useToast(); // Add this hook

  // Add the handleApply function similar to JobListItem
  const handleApply = async (resume: File | null, coverLetter: string) => {
    if (!applyJob) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const rawToken = localStorage.getItem("token");
      if (!rawToken) {
        throw new Error("Please log in to apply");
      }

      const formData = new FormData();
      formData.append("job_listing_id", applyJob.id.toString());
      formData.append("employer_id", applyJob.employer_id.toString());
      formData.append("cover_letter", coverLetter || "");
      if (resume) {
        formData.append("resume", resume);
      }

      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${rawToken.trim()}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const mockError = {
          response: {
            status: response.status,
            data: errorData
          }
        };
        const errorInfo = handleJobApplicationError(mockError);
        showToast(errorInfo);
        setError(errorInfo.message);
        return;
      }

      showToast({
        type: 'success',
        title: 'Application Submitted',
        message: `Your application for "${applyJob.title}" has been submitted successfully!`,
        autoHide: true,
        autoHideDelay: 4000
      });
      
      setApplyJob(null);
      
      // Update job status to "applied"
      if (onJobStatusUpdate) {
        onJobStatusUpdate(applyJob.id, "applied");
      }
    } catch (err) {
      const errorInfo = handleJobApplicationError(err);
      showToast(errorInfo);
      setError(errorInfo.message);
      
      if (errorInfo.message.toLowerCase().includes("log in")) {
        localStorage.removeItem("token");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Your Job Search Overview
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Recommended Jobs */}
      <JobListingsSection
        title="Recommended Jobs For You"
        jobs={jobListings.slice(0, 3)}
        className="mb-8"
        onJobStatusUpdate={onJobStatusUpdate}
        onViewDetails={setSelectedJob}
        onApply={setApplyJob}
      />

      {/* Recent Activity */}
      <ApplicationsSection
        title="Recent Activity"
        applications={applications}
        jobListings={jobListings}
      />

      {selectedJob && (
        <JobDescriptionModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSaveJob={() => {}}
          onUnsaveJob={() => {}}
        />
      )}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => {
            setApplyJob(null);
            setError(null);
          }}
          onApply={handleApply}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
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
          <dt className="text-sm font-medium text-gray-500 truncate">
            {stat.name}
          </dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </div>
            <div
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
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
  className?: string;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
  onViewDetails?: (job: JobListing) => void;
  onApply?: (job: JobListing) => void;
}> = ({ title, jobs, className, onJobStatusUpdate, onViewDetails, onApply }) => (
  <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="bg-white overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {jobs.map((job) => (
          <JobListItem key={job.id} job={job} onViewDetails={onViewDetails} onApply={onApply} />
        ))}
      </ul>
    </div>
  </div>
);

const JobListItem: React.FC<{ job: JobListing; onViewDetails?: (job: JobListing) => void; onApply?: (job: JobListing) => void }> = ({ job, onViewDetails, onApply }) => {
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company';
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  useEffect(() => {
    if (!job.employer_user_id) return;
    const fetchInfo = async () => {
      try {
        const userRes = await fetch(`/api/users/${job.employer_user_id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setFirstName(userData?.data?.first_name || '');
          setLastName(userData?.data?.last_name || '');
        }
        const photoRes = await fetch(`/api/photos/${job.employer_user_id}`);
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setPhotoUrl(photoData?.data?.photo_url || null);
        }
      } catch (e) {
        setPhotoUrl(null);
      }
    };
    fetchInfo();
  }, [job.employer_user_id]);

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserAvatar
              photoUrl={photoUrl ? `${API_BASE_URL}${photoUrl}` : undefined}
              firstName={firstName}
              lastName={lastName}
              size="md"
              className="flex-shrink-0"
            />
            <div className="ml-4">
              <p className="text-lg font-medium text-blue-600">{job.title}</p>
              <p className="text-sm text-gray-500">
                {companyName} • {job.location}
              </p>
            </div>
          </div>
        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
              {job.work_mode || null}
            </span>
            {/* <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-2">
              {job.match}% Match
            </span> */}
          </div>
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
              {skill.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex space-x-3">
        {job.status === "new" ? (
          <button
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => onApply && onApply(job)}
          >
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
        <button
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => onViewDetails && onViewDetails(job)}
        >
          View Details
        </button>
      </div>
    </div>
  </li>
  );
};

const ApplicationsSection: React.FC<{
  title: string;
  applications: Application[];
  jobListings: JobListing[];
}> = ({ title, applications, jobListings }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="bg-white overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {applications.map((app) => {
          const job = jobListings.find((j) => String(j.id) === String(app.jobId));
          return (
            <ApplicationListItem
              key={app.id}
              application={app}
              job={job || createDefaultJob(app.jobId)}
            />
          );
        })}
      </ul>
    </div>
  </div>
);

// Helper function to create a default job when not found
const createDefaultJob = (jobId: number): JobListing => ({
  id: String(jobId),
  employer_user_id: 0,
  title: "Position no longer available",
  company: "Unknown Company",
  location: "Unknown Location",
  salary: "Not specified",
  type: "Unknown",
  posted: "Unknown",
  skills: [],
  status: "new",
  match: 0,
  work_mode: "Remote",
  job_description: "No description available.",
  job_requirements: "No requirements available.",
  employer_id: 0,
});
const ApplicationListItem: React.FC<{
  application: Application;
  job: JobListing;
}> = ({ application, job }) => {
  // Fetch employer avatar info
  const { photoUrl, firstName, lastName } = useEmployerAvatarInfo(job.employer_user_id);

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserAvatar
              photoUrl={photoUrl ? `${API_BASE_URL}${photoUrl}` : undefined}
              firstName={firstName}
              lastName={lastName}
              size="md"
              className="flex-shrink-0"
            />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">
                {job.title} at {typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company'}
              </p>
              <p className="text-xs text-gray-500">
                Applied on {application.date}
              </p>
            </div>
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
            {application.status === "rejected" && (
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                REJECTED
              </span>
            )}
            {application.status === "hired" && (
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                HIRED
              </span>
            )}
            {!application.status && (
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                Status Unknown
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
};

const ProgressBar: React.FC<{ status: string }> = ({ status }) => (
  <div className="flex items-center text-sm text-gray-500">
    <div className="relative pt-1 w-full">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span
            className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
              status === "hired"
                ? "text-green-600 bg-green-200"
                : status === "interview"
                ? "text-yellow-600 bg-yellow-200"
                : status === "rejected"
                ? "text-red-600 bg-red-200"
                : "text-blue-600 bg-blue-200"
            }`}
          >
            {status === "hired"
              ? "HIRED"
              : status === "rejected"
              ? "REJECTED"
              : status || "pending"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block">
            {status === "hired" || status === "rejected"
              ? "100%"
              : status === "interview"
              ? "75%"
              : "40%"} complete
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{
            width: `${
              status === "hired" || status === "rejected"
                ? "100%"
                : status === "interview"
                ? "75%"
                : "40%"
            }`}
          }
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
            status === "hired"
              ? "bg-green-500"
              : status === "rejected"
              ? "bg-red-500"
              : status === "interview"
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
        ></div>
      </div>
    </div>
  </div>
);

export default DashboardTab;