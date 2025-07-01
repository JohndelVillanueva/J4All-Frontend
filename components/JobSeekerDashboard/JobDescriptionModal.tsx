import React, { useState } from "react";
import { FaTimes, FaRegStar, FaStar } from "react-icons/fa";
import { JobListing } from "../types/types";

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
  const [isSaved, setIsSaved] = useState(job.status === "saved");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToggle = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        await onUnsaveJob(Number(job.id));
      } else {
        await onSaveJob(Number(job.id));
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
            {/* Job header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <h2 className="text-xl text-gray-600 mt-1">{job.company}</h2>

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

            {job.skills.length > 0 && (
  <div className="mb-6">
    <h4 className="text-lg font-semibold text-gray-800 mb-2">Skills</h4>
    <div className="flex flex-wrap gap-2">
      {job.skills.map((skillItem, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium"
          title={`${
            skillItem.is_required ? "Required" : "Optional"
          } skill (Level ${skillItem.importance_level})`}
        >
          {skillItem.name} {/* Changed from skillItem.skill.name to skillItem.name */}
        </span>
      ))}
    </div>
  </div>
)}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                  <span className="text-gray-600">
                    {job.company.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">HR Representative</p>
                  <p className="text-gray-600 text-sm">{job.company}</p>
                  <p className="text-gray-500 text-xs">Posted {job.posted}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View more details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDescriptionModal;
