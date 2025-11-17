import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JobListing } from "../types/types";
import { FaBriefcase, FaTrash, FaEye, FaBuilding } from "react-icons/fa";
import JobDescriptionModal from "./JobDescriptionModal";
import ApplyModal from "./ApplyModal";
import UserAvatar from '../UserAvatar';
import { useToast } from "../ToastContainer";
import { handleApiError, handleJobApplicationError } from "../../src/utils/errorHandler";
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
        const token = localStorage.getItem("token");
        if (!token) {
          console.log('No token available for fetching employer info');
          return;
        }
        
        const userRes = await fetch(`/api/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setFirstName(userData?.data?.first_name || '');
          setLastName(userData?.data?.last_name || '');
        }
        const photoRes = await fetch(`/api/photos/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setPhotoUrl(photoData?.data?.photo_url || null);
        }
      } catch (e) {
        console.error('Error fetching employer avatar info:', e);
        setPhotoUrl(null);
      }
    };
    fetchInfo();
  }, [userId]);

  return { photoUrl, firstName, lastName };
}

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
  employer_id: number;
  employer_user_id?: number;
  employer?: any; // Full employer object with company details
}

interface SavedJobsTabProps {
  jobListings: JobListing[];
  onRefresh?: () => void;
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<SavedJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
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
        // Ensure each job has employer_id, employer_user_id, employer data, and logo
        const jobsWithEmployer = data.data.map((job: any) => {
          // Try to get employer_user_id from multiple sources
          const employerUserId = job.employer_user_id 
            || job.employer?.user_id 
            || job.user_id
            || job.employer?.id
            || job.created_by;

          // Get company logo path
          const companyLogo = job.employer?.logo_path 
            || job.logo_path 
            || job.logo 
            || job.employer?.logo;

          console.log('Saved job employer info:', {
            jobId: job.id,
            jobTitle: job.title,
            employerUserId: employerUserId,
            companyLogo: companyLogo,
            rawEmployer: job.employer
          });

          return {
            ...job,
            employer_id: job.employer_id || job.employer?.id || 0,
            employer_user_id: employerUserId,
            employer: job.employer, // Keep the full employer object
            logo: companyLogo
          };
        });
        setSavedJobs(jobsWithEmployer);
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

  // Add the handleApply function
  const handleApply = async (resume: File | null, coverLetter: string) => {
    if (!applyJob) return;
    
    setIsSubmitting(true);
    setApplyError(null);

    let employerId = applyJob.employer_id;
    if (!employerId && (applyJob as any).employer_id) {
      employerId = (applyJob as any).employer_id;
    }

    if (!employerId) {
      const errorInfo = {
        type: 'error' as const,
        title: 'Application Failed',
        message: 'Employer information is missing for this job. Please contact support or try another job.',
        autoHide: true,
        autoHideDelay: 5000
      };
      showToast(errorInfo);
      setApplyError(errorInfo.message);
      setIsSubmitting(false);
      return;
    }

    try {
      const rawToken = localStorage.getItem("token");
      if (!rawToken) {
        throw new Error("Please log in to apply");
      }

      const formData = new FormData();
      formData.append("job_listing_id", applyJob.id.toString());
      formData.append("employer_id", employerId.toString());
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
        setApplyError(errorInfo.message);
        return;
      }

      showToast({
        type: 'success',
        title: 'Application Submitted',
        message: `Your application for "${applyJob.title}" has been submitted successfully!`,
        autoHide: true,
        autoHideDelay: 4000
      });
      
      setIsApplyModalOpen(false);
      setApplyJob(null);
      
      setSavedJobs(prev => prev.filter(job => job.id !== applyJob.id));
    } catch (err) {
      const errorInfo = handleJobApplicationError(err);
      showToast(errorInfo);
      setApplyError(errorInfo.message);
      
      if (errorInfo.message.toLowerCase().includes("log in")) {
        localStorage.removeItem("token");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveJob = async () => {
    // Job is already saved, so this function won't be called
  };

  const handleUnsaveJob = async (jobId: number) => {
    await handleRemoveJob(jobId);
    setIsModalOpen(false);
  };

  const handleViewDetails = (job: SavedJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApplyNow = (job: SavedJob) => {
    setApplyJob(job);
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    if (selectedJob) {
      handleApplyNow(selectedJob);
    }
  };

  // Navigate to employer profile
  const handleViewEmployerProfile = (employerId: number) => {
    navigate(`/employer/${employerId}`);
  };

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
                <SavedJobListItem
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewDetails}
                  onRemove={handleRemoveJob}
                  onViewEmployerProfile={handleViewEmployerProfile}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedJob && isModalOpen && (
        <JobDescriptionModal
          job={selectedJob as any}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJob(null);
          }}
          onSaveJob={handleSaveJob}
          onUnsaveJob={handleUnsaveJob}
          onApplySuccess={handleApplySuccess}
        />
      )}

      {applyJob && isApplyModalOpen && (
        <ApplyModal
          job={applyJob as any}
          onClose={() => {
            setIsApplyModalOpen(false);
            setApplyJob(null);
            setApplyError(null);
          }}
          onApply={handleApply}
          isSubmitting={isSubmitting}
          error={applyError}
        />
      )}
    </div>
  );
};

// Separate component for each saved job item
const SavedJobListItem: React.FC<{
  job: SavedJob;
  onViewDetails: (job: SavedJob) => void;
  onRemove: (jobId: number) => void;
  onViewEmployerProfile: (employerId: number) => void;
}> = ({ job, onViewDetails, onRemove, onViewEmployerProfile }) => {
  // Get company logo from employer data
  const companyLogo = job.logo || job.employer?.logo_path;
  const companyName = job.company || job.employer?.company_name;

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Display Company Logo */}
            <div 
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => job.employer_user_id && onViewEmployerProfile(job.employer_user_id)}
              title="View company profile"
            >
              {companyLogo ? (
                <img
                  src={`${API_BASE_URL}${companyLogo}`}
                  alt={`${companyName} logo`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    // Fallback to company initial if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg"
                style={{ display: companyLogo ? 'none' : 'flex' }}
              >
                {companyName?.charAt(0).toUpperCase() || 'C'}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-blue-600">{job.title}</p>
              <p 
                className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"
                onClick={() => job.employer_user_id && onViewEmployerProfile(job.employer_user_id)}
                title="View company profile"
              >
                {companyName} • {job.location}
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
          {job.employer_user_id && (
            <button 
              onClick={() => onViewEmployerProfile(job.employer_user_id!)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaBuilding className="mr-1 h-3 w-3" />
              View Company
            </button>
          )}
          <button 
            onClick={() => onViewDetails(job)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaEye className="mr-1 h-3 w-3" />
            View Details
          </button>
          <button 
            onClick={() => onRemove(job.id)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaTrash className="mr-1 h-3 w-3" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
};

export default SavedJobsTab;