import React, { useState, useEffect } from "react";
import { FaBriefcase, FaComments, FaUserFriends } from "react-icons/fa";
import { JobListing } from "../types/types";
import ApplyModal from "./ApplyModal";
import MessageModal from "./MessageModal";
import { useToast } from "../../components/ToastContainer";
import { handleJobApplicationError } from "../../src/utils/errorHandler";
import UserAvatar from '../UserAvatar';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface JobListItemProps {
  job: JobListing;
  onApplySuccess?: () => void;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
  onViewDetails?: (job: JobListing) => void;
  isSelected?: boolean;
}

// Dynamic hook to fetch user info and photo by userId
function useUserAvatarInfo(userId?: number) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  useEffect(() => {
    if (!userId) return;
    
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
        };

        const userRes = await fetch(`/api/users/${userId}`, { headers });
        
        // Silently handle 403 - user doesn't have permission
        if (userRes.status === 403) {
          return;
        }
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setFirstName(userData?.data?.first_name || '');
          setLastName(userData?.data?.last_name || '');
        }
        
        const photoRes = await fetch(`/api/photos/${userId}`, { headers });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setPhotoUrl(photoData?.data?.photo_url || null);
        }
      } catch (e) {
        // Silently fail - component will use fallback
        setPhotoUrl(null);
      }
    };
    
    fetchInfo();
  }, [userId]);

  return { photoUrl, firstName, lastName };
}

const JobListItem: React.FC<JobListItemProps> = ({ 
  job, 
  onApplySuccess, 
  onJobStatusUpdate,
  onViewDetails,
  isSelected = false
}) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const avatarUserId = job.employer_user_id;
  const { photoUrl, firstName, lastName } = useUserAvatarInfo(avatarUserId);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [, setIsBookmarkFilled] = useState(job.status === "saved");
  const [isApplied, setIsApplied] = useState(job.status === "applied");

  // Check saved status from backend
useEffect(() => {
  const checkSavedStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/check-saved-job/${job.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      // Silently handle 404 - endpoint not implemented yet
      if (response.status === 404) {
        setIsBookmarkFilled(job.status === "saved");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setIsBookmarkFilled(data.data.isSaved);
        
        if (onJobStatusUpdate && data.data.isSaved && job.status !== "saved") {
          onJobStatusUpdate(job.id, "saved");
        }
      }
    } catch (error) {
      // Silently fallback to prop value
      setIsBookmarkFilled(job.status === "saved");
    }
  };

  checkSavedStatus();
}, [job.id, job.status, onJobStatusUpdate]);

  // Check if user has already applied to this job
  useEffect(() => {
    const checkAppliedStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`/api/applications`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const hasApplied = data.data.some((app: any) => String(app.jobId) === String(job.id));
            setIsApplied(hasApplied);
          }
        }
      } catch (error) {
        console.error("Error checking applied status:", error);
      }
    };

    checkAppliedStatus();
  }, [job.id]);

  const handleApply = async (resume: File | null, coverLetter: string) => {
    setIsSubmitting(true);
    setError(null);
  
    try {
      const rawToken = localStorage.getItem("token");
      if (!rawToken) {
        throw new Error("Please log in to apply");
      }
  
      const formData = new FormData();
      formData.append("job_listing_id", job.id.toString());
      formData.append("employer_id", job.employer_id.toString());
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
        message: `Your application for "${job.title}" has been submitted successfully!`,
        autoHide: true,
        autoHideDelay: 4000
      });
      
      setIsApplyModalOpen(false);
      setIsApplied(true); // Update local applied status
      
      if (onJobStatusUpdate) {
        onJobStatusUpdate(job.id, "applied");
      }
      
      if (onApplySuccess) onApplySuccess();
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

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(job);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMessageModalOpen(true);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplyModalOpen(true);
  };

  // const handleSaveClick = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
    
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       throw new Error("Please log in to save jobs");
  //     }

  //     if (isBookmarkFilled) {
  //       // Unsave job
  //       const response = await fetch("/api/unsave-job", {
  //         method: "DELETE",
  //         headers: {
  //           "Authorization": `Bearer ${token}`,
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({ job_id: Number(job.id) })
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         const mockError = {
  //           response: {
  //             status: response.status,
  //             data: errorData
  //           }
  //         };
  //         const errorInfo = handleJobApplicationError(mockError);
  //         showToast(errorInfo);
  //         return;
  //       }

  //       setIsBookmarkFilled(false);
  //       showToast({
  //         type: 'success',
  //         title: 'Job Removed',
  //         message: 'Job has been removed from your saved jobs.',
  //         autoHide: true,
  //         autoHideDelay: 3000
  //       });
        
  //       if (onJobStatusUpdate) {
  //         onJobStatusUpdate(job.id, "new");
  //       }
  //     } else {
  //       // Save job
  //       const response = await fetch("/api/save-job", {
  //         method: "POST",
  //         headers: {
  //           "Authorization": `Bearer ${token}`,
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({ job_id: Number(job.id) })
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         const mockError = {
  //           response: {
  //             status: response.status,
  //             data: errorData
  //           }
  //         };
  //         const errorInfo = handleJobApplicationError(mockError);
  //         showToast(errorInfo);
  //         return;
  //       }

  //       setIsBookmarkFilled(true);
  //       showToast({
  //         type: 'success',
  //         title: 'Job Saved',
  //         message: 'Job has been added to your saved jobs.',
  //         autoHide: true,
  //         autoHideDelay: 3000
  //       });
        
  //       if (onJobStatusUpdate) {
  //         onJobStatusUpdate(job.id, "saved");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error saving job:", error);
  //     const errorInfo = handleJobApplicationError(error);
  //     showToast(errorInfo);
  //   }
  // };

  return (
    <>
      <li 
        className={`border border-gray-200 rounded-lg mb-4 cursor-pointer hover:border-gray-300 transition-all ${
          isSelected ? 'border-gray-900 shadow-sm' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="px-6 py-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start flex-1">
              <UserAvatar
                photoUrl={photoUrl ? `${API_BASE_URL}${photoUrl}` : undefined}
                firstName={firstName}
                lastName={lastName}
                size="md"
                className="flex-shrink-0 mt-1"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 font-light">
                  {(typeof job.company === "string"
                    ? job.company
                    : job.company?.name || "Unknown Company")}
                </p>
                <p className="text-sm text-gray-500 font-light mt-1">
                  {job.location}
                </p>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
              <span className="text-xs text-gray-400 font-light">{job.posted}</span>
              {/* <button
                onClick={handleSaveClick}
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title={isBookmarkFilled ? "Remove from saved jobs" : "Save job"}
              >
                <svg className="w-5 h-5" fill={isBookmarkFilled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button> */}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 font-light">
            <span className="flex items-center gap-1">
              <FaBriefcase className="text-gray-400 text-xs" />
              {job.type}
            </span>
            <span>{job.work_mode}</span>
            {typeof (job as any).applicants !== 'undefined' && (
              <span className="flex items-center gap-1">
                <FaUserFriends className="text-gray-400 text-xs" />
                {(job as any).applicants} applicant{(job as any).applicants === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 3).map((skillItem, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-light border border-gray-200 rounded"
                  title={`${
                    skillItem.is_required ? "Required" : "Optional"
                  } skill (Level ${skillItem.importance_level})`}
                >
                  {skillItem.name}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="px-3 py-1 text-xs font-light border border-gray-200 rounded text-gray-500">
                  +{job.skills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              {/* Show Apply button or Applied status, independent of saved status */}
              {isApplied ? (
                <span className="px-4 py-2 text-sm font-light bg-green-50 text-green-700 border border-green-200 rounded flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Applied
                </span>
              ) : (
                <button
                  onClick={handleApplyClick}
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-light border border-gray-200 rounded text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-colors ${isSubmitting ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? 'Applying...' : 'Apply Now'}
                </button>
              )}
              
              {/* Save/Unsave button - always show */}
              {/* <button
                onClick={handleSaveClick}
                className="px-4 py-2 text-sm font-light border border-gray-200 rounded text-gray-700 hover:border-gray-300 transition-colors flex items-center gap-2"
                title={isBookmarkFilled ? "Remove from saved jobs" : "Save job"}
              >
                <svg className="w-4 h-4" fill={isBookmarkFilled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isBookmarkFilled ? 'Unsave' : 'Save'}
              </button> */}
              
              <button
                onClick={handleMessageClick}
                className="px-4 py-2 text-sm font-light border border-gray-200 rounded text-gray-700 hover:border-gray-300 transition-colors flex items-center gap-2"
              >
                <FaComments className="text-gray-400" />
                Message
              </button>
            </div>
            {job.salary && (
              <span className="text-sm font-medium text-gray-900">{job.salary}</span>
            )}
          </div>
        </div>
      </li>

      {isApplyModalOpen && (
        <ApplyModal
          job={job}
          onClose={() => {
            setIsApplyModalOpen(false);
            setError(null);
          }}
          onApply={handleApply}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
      
      {isMessageModalOpen && (
        <MessageModal
          job={job}
          onClose={() => {
            setIsMessageModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default JobListItem;