import React, { useState } from "react";
import { FaTimes, FaRegStar, FaStar, FaComments } from "react-icons/fa";
import { JobListing } from "../types/types";
import MessageModal from "./MessageModal";
import ApplyModal from "./ApplyModal"; // Add this import
import { useToast } from "../ToastContainer";
import { handleApiError, handleJobApplicationError } from "../../src/utils/errorHandler"; // Add handleJobApplicationError
import { getFullPhotoUrl } from "../../components/utils/photo";

interface JobDescriptionModalProps {
  job: JobListing;
  onClose: () => void;
  onSaveJob: (jobId: number) => void;
  onUnsaveJob: (jobId: number) => void;
  onApplySuccess?: () => void; // Add this prop
}

const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  job,
  onClose,
  onSaveJob,
  onUnsaveJob,
  onApplySuccess,
}) => {
  const jobWithHR = job as any;
  const [isSaved, setIsSaved] = useState(job.status === "saved");
  const [isSaving, setIsSaving] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); // Add this state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state
  const [error, setError] = useState<string | null>(null); // Add this state
  const { showToast } = useToast();

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

        await onUnsaveJob(Number(job.id));
        showToast({
          type: 'success',
          title: 'Job Removed',
          message: 'Job has been removed from your saved jobs.',
          autoHide: true,
          autoHideDelay: 3000
        });
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

        await onSaveJob(Number(job.id));
        showToast({
          type: 'success',
          title: 'Job Saved',
          message: 'Job has been added to your saved jobs.',
          autoHide: true,
          autoHideDelay: 3000
        });
      }
      
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving job:", error);
      const errorInfo = handleApiError(error);
      showToast(errorInfo);
    } finally {
      setIsSaving(false);
    }
  };

  // Add the handleApply function
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

  return (
    <>
      {/* Blurred backdrop */}
      <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm z-40"></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative border-b-4 border-black-500 shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 z-10 bg-white rounded-full p-1 shadow-sm"
            disabled={isSaving}
            aria-label="Close modal"
          >
            <FaTimes className="h-4 w-4" />
          </button>
          
          <div className="p-4">
            {/* Fallback warning if job is not available */}
            {(job.id === "0" || job.title === "Position no longer available") ? (
              <div className="text-center py-6">
                <h2 className="text-lg font-bold text-gray-800 mb-2">This job posting is no longer available.</h2>
                <p className="text-gray-600 text-sm">The job you are trying to view may have been removed or is no longer accessible.</p>
              </div>
            ) : (
              <>
                {/* Job header */}
                <div className="mb-4">
                  <h1 className="text-lg font-bold text-gray-900">{job.title}</h1>
                  <h2 className="text-md text-gray-600 mt-1">
                    {typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company'}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {job.salary}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {job.work_mode} - {job.location}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Apply and Save buttons */}
                <div className="border-t border-b border-gray-200 py-3 my-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {job.status === "applied" ? (
                      <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm">
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsApplyModalOpen(true)}
                        className="flex-1 min-w-[100px] py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                        disabled={isSaving}
                      >
                        Apply Now
                      </button>
                    )}
                    <button
                      onClick={() => setIsMessageModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                    >
                      <FaComments className="h-3 w-3" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={handleSaveToggle}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      disabled={isSaving}
                      aria-label={isSaved ? "Unsave job" : "Save job"}
                    >
                      {isSaved ? (
                        <FaStar className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <FaRegStar className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Job description */}
                <div className="mb-4">
                  <h3 className="text-md font-bold text-gray-900 mb-2">
                    Job Description
                  </h3>

                  {job.job_description && (
                    <div className="prose prose-sm max-w-none text-gray-700 overflow-hidden break-words text-sm">
                      {job.job_description}
                    </div>
                  )}

                  <div className="mt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      Requirements
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700 overflow-hidden break-words text-sm">
                      {job.job_requirements}
                    </div>
                  </div>
                </div>

                {/* Skills section */}
                {Array.isArray(job.skills) && job.skills.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skillItem, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium"
                          title={`${skillItem.is_required ? "Required" : "Optional"} skill (Level ${skillItem.importance_level})`}
                        >
                          {skillItem.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Skills</h4>
                    <div className="text-gray-500 text-xs">No skills listed.</div>
                  </div>
                )}

                {/* HR info section */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center">
                    {jobWithHR.hrPhoto ? (
                      <img
                        src={getFullPhotoUrl(jobWithHR.hrPhoto)}
                        alt="HR"
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                        <span className="text-gray-600 text-xs">
                          {(typeof job.company === 'string' ? job.company : job.company?.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {jobWithHR.hrFirstName || jobWithHR.hrLastName ? `${jobWithHR.hrFirstName ?? ''} ${jobWithHR.hrLastName ?? ''}`.trim() : 'HR Representative'}
                      </p>
                      <p className="text-gray-600 text-xs truncate">
                        {typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company'}
                      </p>
                      <p className="text-gray-500 text-xs">Posted {job.posted}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isMessageModalOpen && (
        <MessageModal
          job={job}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}

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
    </>
  );
};

export default JobDescriptionModal;