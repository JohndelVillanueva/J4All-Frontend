import React, { useState, useEffect } from "react";
import { JobListing } from "../types/types";
import { FaBriefcase, FaTrash, FaEye } from "react-icons/fa";
import JobDescriptionModal from "./JobDescriptionModal";
import { useToast } from "../ToastContainer";
import { handleApiError } from "../../src/utils/errorHandler";

interface SavedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  workMode?: string;
  logo?: string;
  savedDate: string;
  status: string;
  job_description?: string;
  job_requirements?: string;
  skills?: any[];
}

interface SavedJobsTabProps {
  jobListings: JobListing[];
  onRefresh?: () => void;
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Fetch saved jobs from backend
  const fetchSavedJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/saved-jobs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Create a mock error object for the error handler
        const mockError = {
          response: {
            status: response.status,
            data: errorData
          }
        };
        
        const errorInfo = handleApiError(mockError);
        showToast(errorInfo);
        setError(errorInfo.message);
        setSavedJobs([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSavedJobs(data.data);
      } else {
        setSavedJobs([]);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      showToast(errorInfo);
      setError(errorInfo.message);
      console.error("Saved jobs fetch error:", err);
      setSavedJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove saved job
  const handleRemoveJob = async (jobId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/unsave-job", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ job_id: jobId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Create a mock error object for the error handler
        const mockError = {
          response: {
            status: response.status,
            data: errorData
          }
        };
        
        const errorInfo = handleApiError(mockError);
        showToast(errorInfo);
        return;
      }

      // Remove from local state
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      showToast({
        type: 'success',
        title: 'Job Removed',
        message: 'Job has been removed from your saved jobs.',
        autoHide: true,
        autoHideDelay: 3000
      });
    } catch (err) {
      console.error("Error removing job:", err);
      const errorInfo = handleApiError(err);
      showToast(errorInfo);
    }
  };

  // Handle save/unsave job from modal
  const handleSaveJob = async (jobId: number) => {
    // Job is already saved, so this function won't be called
    // But we need it for the modal interface
  };

  const handleUnsaveJob = async (jobId: number) => {
    await handleRemoveJob(jobId);
    setIsModalOpen(false);
  };

  // Open job details modal
  const handleViewDetails = (job: SavedJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Fetch saved jobs on component mount
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Jobs</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Jobs</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Jobs</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Jobs You've Saved for Later
          </h3>
          <button
            onClick={fetchSavedJobs}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>
        <div className="bg-white overflow-hidden">
          {savedJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>You haven't saved any jobs yet.</p>
              <p className="text-sm">Click the star icon on any job to save it for later.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {savedJobs.map((job) => (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {job.logo ? (
                            <img
                              src={job.logo}
                              alt={job.company}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 text-lg font-medium">
                              {job.company.charAt(0)}
                            </span>
                          )}
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
                          Saved
                        </span>
                        <span className="text-sm text-gray-500">Saved on {job.savedDate}</span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <FaBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {job.salary
                            ? job.salary.replace(/\$/g, "₱")
                            : "₱ Negotiable"}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {job.type}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="text-xs text-gray-400">Posted {job.posted}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-3">
                      <button 
                        onClick={() => handleViewDetails(job)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEye className="mr-1 h-3 w-3" />
                        View Details
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Apply Now
                      </button>
                      <button 
                        onClick={() => handleRemoveJob(job.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaTrash className="mr-1 h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Job Description Modal */}
      {selectedJob && isModalOpen && (
        <JobDescriptionModal
          job={selectedJob as any}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJob(null);
          }}
          onSaveJob={handleSaveJob}
          onUnsaveJob={handleUnsaveJob}
        />
      )}
    </div>
  );
};

export default SavedJobsTab;