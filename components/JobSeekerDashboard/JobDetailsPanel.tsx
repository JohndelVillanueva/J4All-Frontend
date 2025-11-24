import React, { useState, useEffect } from "react";
import { FaTimes, FaMapMarkerAlt, FaBriefcase, FaUserFriends, FaComments } from "react-icons/fa";
import { JobListing } from "../types/types";
import ApplyModal from "./ApplyModal";
import MessageModal from "./MessageModal";
import UserAvatar from '../UserAvatar';
import { useToast } from "../../components/ToastContainer";
import { handleJobApplicationError } from "../../src/utils/errorHandler";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface JobDetailsPanelProps {
  job: JobListing;
  onClose: () => void;
  onApplySuccess?: () => void;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
}

function useUserAvatarInfo(userId?: number) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  useEffect(() => {
    if (!userId) return;
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const userRes = await fetch(`/api/users/${userId}`, { headers });
        if (userRes.ok) {
          const userData = await userRes.json();
          setFirstName(userData?.data?.first_name || '');
          setLastName(userData?.data?.last_name || '');
        }
        
        const photoRes = await fetch(`/api/photos/${userId}`, { headers });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setPhotoUrl(photoData?.data?.photo_url || null);
        } else {
          setPhotoUrl(null);
        }
      } catch (e) {
        setPhotoUrl(null);
      }
    };
    fetchInfo();
  }, [userId]);

  return { photoUrl, firstName, lastName };
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({ 
  job, 
  onClose,
  onApplySuccess,
  onJobStatusUpdate 
}) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(job.status === "saved");
  const [isApplied, setIsApplied] = useState(job.status === "applied"); // Track applied status
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  
  const avatarUserId = job.employer_user_id;
  const { photoUrl, firstName, lastName } = useUserAvatarInfo(avatarUserId);
  
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || "Company Name";
  const location = job.location || "Work from Home";
  const jobType = job.type || job.jobType || "Full-time";

  // Check saved status on mount
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

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSavedStatus();
  }, [job.id]);

  // Check if user has already applied to this job on mount
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
            // Check if this job is in the applications list
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

  const handleSaveToggle = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to save jobs");
      }

      if (isSaved) {
        // Unsave job
        const response = await fetch("/api/unsave-job", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ job_id: Number(job.id) })
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
          return;
        }

        setIsSaved(false);
        showToast({
          type: 'success',
          title: 'Job Removed',
          message: 'Job has been removed from your saved jobs.',
          autoHide: true,
          autoHideDelay: 3000
        });
        
        if (onJobStatusUpdate) {
          onJobStatusUpdate(job.id, "new");
        }
      } else {
        // Save job
        const response = await fetch("/api/save-job", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ job_id: Number(job.id) })
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
          return;
        }

        setIsSaved(true);
        showToast({
          type: 'success',
          title: 'Job Saved',
          message: 'Job has been added to your saved jobs.',
          autoHide: true,
          autoHideDelay: 3000
        });
        
        if (onJobStatusUpdate) {
          onJobStatusUpdate(job.id, "saved");
        }
      }
    } catch (error) {
      console.error("Error saving job:", error);
      const errorInfo = handleJobApplicationError(error);
      showToast(errorInfo);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg flex flex-col border border-gray-200 h-[calc(100vh-3rem)]">
        {/* Minimal Header - Fixed */}
        <div className="border-b border-gray-200 p-8 relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <FaTimes size={20} />
          </button>
          
          <div className="flex items-start gap-5 pr-12">
            <UserAvatar
              photoUrl={photoUrl ? `${API_BASE_URL}${photoUrl}` : undefined}
              firstName={firstName}
              lastName={lastName}
              size="lg"
              className="flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">{job.title}</h1>
              <p className="text-base text-gray-600 font-light">{companyName}</p>
              {((job as any).hrFirstName || (job as any).hrLastName) && (
                <p className="text-sm text-gray-500 mt-2 font-light">
                  Contact: {((job as any).hrFirstName ?? '')} {((job as any).hrLastName ?? '')}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
                title={isSaved ? "Remove from saved jobs" : "Save job"}
              >
                <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1 min-h-0">
          {/* Job Description */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">
              Job Description
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 font-light leading-relaxed">
              {(job as any).job_description || job.description ? (
                <div className="whitespace-pre-wrap">
                  {(job as any).job_description || job.description}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description available.</p>
              )}
            </div>
          </div>

          {/* Job Requirements */}
          {((job as any).job_requirements || (job as any).requirements) && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">
                Job Requirements
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 font-light leading-relaxed">
                <div className="whitespace-pre-wrap">
                  {(job as any).job_requirements || (job as any).requirements}
                </div>
              </div>
            </div>
          )}

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => {
                  const skillName = typeof skill === 'string' ? skill : skill?.name || '';
                  const isRequired = typeof skill === 'object' && skill?.is_required;
                  const importanceLevel = typeof skill === 'object' ? skill?.importance_level : null;
                  
                  return (
                    <span 
                      key={index}
                      className={`px-4 py-2 rounded text-sm font-light border transition-colors ${
                        isRequired 
                          ? 'bg-gray-50 text-gray-900 border-gray-300' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                      title={`${isRequired ? "Required" : "Optional"} skill${importanceLevel ? ` (Level ${importanceLevel})` : ''}`}
                    >
                      {skillName}
                      {isRequired && ' •'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Job Details - Moved to bottom after Required Skills */}
          <div className="space-y-6">
            {/* Minimal Info Grid */}
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Location</div>
                <div className="flex items-center gap-2 text-gray-900 font-light">
                  <FaMapMarkerAlt className="text-gray-400 text-sm" />
                  <span>{location}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Type</div>
                <div className="flex items-center gap-2 text-gray-900 font-light">
                  <FaBriefcase className="text-gray-400 text-sm" />
                  <span>{jobType}</span>
                </div>
              </div>
              {job.work_mode && (
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Work Mode</div>
                  <div className="text-gray-900 font-light">{job.work_mode}</div>
                </div>
              )}
              {typeof (job as any).applicants !== 'undefined' && (
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">Applicants</div>
                  <div className="flex items-center gap-2 text-gray-900 font-light">
                    <FaUserFriends className="text-gray-400 text-sm" />
                    <span>{(job as any).applicants} {(job as any).applicants === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Posted Date */}
            {job.posted && (
              <div className="text-sm text-gray-500 font-light">
                Posted {job.posted}
              </div>
            )}

            {/* Salary - Minimal */}
            {job.salary && (
              <div className="pb-6 border-b border-gray-100">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">Compensation</div>
                <p className="text-2xl font-light text-gray-900">{job.salary}</p>
              </div>
            )}
          </div>

          {/* Fallback info if no description */}
          {!(job as any).job_description && !job.description && !(job as any).job_requirements && !(job as any).requirements && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-5">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">Role</span>
                  <span className="text-gray-900">{job.title}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">Company</span>
                  <span className="text-gray-900">{companyName}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">Location</span>
                  <span className="text-gray-900">{location}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-900">{jobType}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <span className="text-gray-500">Work Mode</span>
                  <span className="text-gray-900">{job.work_mode}</span>
                </div>
                
                {job.salary && (
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <span className="text-gray-500">Salary</span>
                    <span className="text-gray-900">{job.salary}</span>
                  </div>
                )}
                
                <p className="text-gray-400 italic text-sm mt-8">
                  Apply or contact the employer for complete position details.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons - Moved to very bottom */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {/* Show apply button only if not applied, otherwise show applied status */}
            {isApplied ? (
              <div className="flex-1 bg-green-50 text-green-700 py-3.5 px-6 rounded font-light tracking-wide text-center border border-green-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Application Submitted
              </div>
            ) : (
              <button 
                onClick={() => setIsApplyModalOpen(true)}
                disabled={isSubmitting}
                className={`flex-1 border border-gray-200 text-gray-700 py-3.5 px-6 rounded font-light tracking-wide hover:border-gray-900 hover:bg-gray-50 transition-all ${isSubmitting ? 'opacity-50' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Apply for Position'}
              </button>
            )}
            
            {/* Message button */}
            <button 
              onClick={() => setIsMessageModalOpen(true)}
              className="px-5 border border-gray-200 rounded hover:border-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FaComments className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

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
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}
    </>
  );
};

export default JobDetailsPanel;