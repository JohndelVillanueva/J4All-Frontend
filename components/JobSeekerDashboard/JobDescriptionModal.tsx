import React, { useState } from "react";
import { FaTimes, FaRegStar, FaStar, FaComments } from "react-icons/fa";
import { JobListing } from "../types/types";
import MessageModal from "./MessageModal";
import { useToast } from "../ToastContainer";
import { handleApiError } from "../../src/utils/errorHandler";
import { getFullPhotoUrl } from "../../components/utils/photo";

interface JobDescriptionModalProps {
  job: JobListing;
  onClose: () => void;
  onSaveJob: (jobId: number) => void;
  onUnsaveJob: (jobId: number) => void;
}

const JobDescriptionModal: React.FC<JobDescriptionModalProps> = ({
  job,
  onClose,
  onSaveJob,
  onUnsaveJob,
}) => {
  const jobWithHR = job as any;
  const [isSaved, setIsSaved] = useState(job.status === "saved");
  const [isSaving, setIsSaving] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
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

  console.log('Job in modal:', jobWithHR);
  // console.log('Formatted jobs sample:', formattedJobs[0]);

  return (
    <>
      {/* Blurred backdrop */}
      <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm z-40 "></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-b-4 border-black-500">
          {" "}
          {/* Added relative here */}
          {/* Close button - now positioned relative to the modal */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-10"
            disabled={isSaving}
          >
            <FaTimes className="h-6 w-6" />
          </button>
          <div className="p-6">
            {/* Fallback warning if job is not available */}
            {(job.id === "0" || job.title === "Position no longer available") ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">This job posting is no longer available.</h2>
                <p className="text-gray-600">The job you are trying to view may have been removed or is no longer accessible.</p>
              </div>
            ) : (
              <>
                {/* Job header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <h2 className="text-xl text-gray-600 mt-1">
                    {typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company'}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      {job.salary}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      {job.work_mode} - {job.location}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Apply and Save buttons */}
                <div className="border-t border-b border-gray-200 py-4 my-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-40 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={isSaving || job.status === "applied"}
                    >
                      {job.status === "applied" ? "Applied" : "Apply Now"}
                    </button>
                    <button
                      onClick={() => setIsMessageModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      <FaComments className="h-4 w-4" />
                      Message
                    </button>
                    <button
                      onClick={handleSaveToggle}
                      className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      disabled={isSaving}
                      aria-label={isSaved ? "Unsave job" : "Save job"}
                    >
                      {isSaved ? (
                        <FaStar className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <FaRegStar className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rest of the modal content remains the same */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Job Description
                  </h3>

                  {job.job_description && (
                    <div className="prose prose-sm text-gray-700">
                      {job.job_description}
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Requirements
                    </h4>
                    <div className="prose prose-sm text-gray-700">
                      {job.job_requirements}
                    </div>
                  </div>
                </div>

                {Array.isArray(job.skills) && job.skills.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skillItem, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium"
                          title={`$
                            {skillItem.is_required ? "Required" : "Optional"}
                          } skill (Level ${skillItem.importance_level})`}
                        >
                          {skillItem.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Skills</h4>
                    <div className="text-gray-500 text-sm">No skills listed.</div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    {jobWithHR.hrPhoto ? (
                      <img
                        src={getFullPhotoUrl(jobWithHR.hrPhoto)}
                        alt="HR"
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                        <span className="text-gray-600">
                          {(typeof job.company === 'string' ? job.company : job.company?.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {jobWithHR.hrFirstName || jobWithHR.hrLastName ? `${jobWithHR.hrFirstName ?? ''} ${jobWithHR.hrLastName ?? ''}`.trim() : 'HR Representative'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company'}
                      </p>
                      <p className="text-gray-500 text-xs">Posted {job.posted}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    View more details
                  </button>
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
    </>
  );
};

export default JobDescriptionModal;
