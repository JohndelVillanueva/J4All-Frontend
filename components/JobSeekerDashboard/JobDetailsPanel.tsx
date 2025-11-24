// Replace your JobDetailsPanel component with this fixed version

import React, { useState, useEffect } from "react";
import { FaTimes, FaMapMarkerAlt, FaBriefcase, FaUserFriends, FaComments } from "react-icons/fa";
import { JobListing } from "../types/types";
import ApplyModal from "./ApplyModal";
import MessageModal from "./MessageModal";
// import UserAvatar from '../UserAvatar';
import { useToast } from "../../components/ToastContainer";
import { handleJobApplicationError } from "../../src/utils/errorHandler";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface JobDetailsPanelProps {
  job: JobListing;
  onClose: () => void;
  onApplySuccess?: () => void;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
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
  const [isApplied, setIsApplied] = useState(job.status === "applied");
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  
  // Get company logo from multiple possible sources
  const companyLogo = job.logo_path 
    || (typeof job.company === 'object' ? job.company?.logo : null)
    || (job.employer as any)?.logo_path 
    || (job.employer as any)?.logo;
  
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || "Company Name";
  const location = job.location || "Work from Home";
  const jobType = job.type || job.jobType || "Full-time";
  
  // HR contact info (for contact person display, not the main avatar)
  const hrFirstName = (job as any).hrFirstName || '';
  const hrLastName = (job as any).hrLastName || '';
  // const hrPhoto = (job as any).hrPhoto || null;

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

      // Silently handle 404 - endpoint not implemented yet
      if (response.status === 404) {
        setIsSaved(job.status === "saved");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.data.isSaved);
      }
    } catch (error) {
      // Silently fallback to prop value
      setIsSaved(job.status === "saved");
    }
  };

  checkSavedStatus();
}, [job.id, job.status]);

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
      setIsApplied(true);
      
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
      {/* KEY FIX: Added h-full and flex flex-col to ensure proper height constraint */}
      <div className="bg-white shadow-sm rounded-lg flex flex-col border border-gray-200 h-full overflow-hidden">
        {/* Fixed Header */}
        <div className="border-b border-gray-200 p-6 flex-shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors z-10"
          >
            <FaTimes size={20} />
          </button>
          
          <div className="flex items-start gap-5 pr-12">
            {/* Company Logo - Show company logo instead of HR avatar */}
            {companyLogo ? (
              <img
                src={`${API_BASE_URL}${companyLogo}`}
                alt={`${companyName} logo`}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  // Fallback to company initial if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback: Company initial avatar */}
            <div 
              className={`w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm ${companyLogo ? 'hidden' : 'flex'}`}
            >
              {companyName.charAt(0).toUpperCase()}
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-base text-gray-600 font-medium">{companyName}</p>
              
              {/* HR Contact Info - Display below company name */}
              {(hrFirstName || hrLastName) && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Contact: {hrFirstName} {hrLastName}</span>
                </div>
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

        {/* KEY FIX: Changed from p-8 overflow-y-auto to have proper flex behavior */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-6">
            {/* Job Description */}
            <div className="pb-6 border-b border-gray-100">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
                Job Description
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
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
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
                  Job Requirements
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <div className="whitespace-pre-wrap">
                    {(job as any).job_requirements || (job as any).requirements}
                  </div>
                </div>
              </div>
            )}

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
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
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isRequired 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                        title={`${isRequired ? "Required" : "Optional"} skill${importanceLevel ? ` (Level ${importanceLevel})` : ''}`}
                      >
                        {skillName}
                        {isRequired && ' *'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Location</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <FaMapMarkerAlt className="text-gray-400 text-sm" />
                  <span>{location}</span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Type</div>
                <div className="flex items-center gap-2 text-gray-900">
                  <FaBriefcase className="text-gray-400 text-sm" />
                  <span>{jobType}</span>
                </div>
              </div>
              {job.work_mode && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Work Mode</div>
                  <div className="text-gray-900">{job.work_mode}</div>
                </div>
              )}
              {typeof (job as any).applicants !== 'undefined' && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Applicants</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <FaUserFriends className="text-gray-400 text-sm" />
                    <span>{(job as any).applicants} {(job as any).applicants === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Posted Date */}
            {job.posted && (
              <div className="text-sm text-gray-500 pb-6 border-b border-gray-100">
                Posted {job.posted}
              </div>
            )}

            {/* Salary */}
            {job.salary && (
              <div className="pb-6">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Compensation</div>
                <p className="text-2xl font-semibold text-gray-900">{job.salary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="border-t border-gray-200 p-6 flex-shrink-0 bg-white">
          <div className="flex gap-3">
            {isApplied ? (
              <div className="flex-1 bg-green-50 text-green-700 py-3 px-6 rounded-lg font-medium text-center border border-green-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Application Submitted
              </div>
            ) : (
              <button 
                onClick={() => setIsApplyModalOpen(true)}
                disabled={isSubmitting}
                className={`flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Apply for Position'}
              </button>
            )}
            
            <button 
              onClick={() => setIsMessageModalOpen(true)}
              className="px-5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Message employer"
            >
              <FaComments className="text-gray-600" />
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