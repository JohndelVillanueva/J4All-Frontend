import React, { useState, useEffect } from "react";
import { FaBriefcase, FaChevronLeft, FaChevronRight, FaComments, FaUserFriends } from "react-icons/fa";
import { JobListing } from "../types/types";
// import CompanyLogo from "./CompanyLogo";
import JobDescriptionModal from "./JobDescriptionModal";
import ApplyModal from "./ApplyModal";
import MessageModal from "./MessageModal";
// import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ToastContainer";
import { handleJobApplicationError } from "../../src/utils/errorHandler";
import UserAvatar from '../UserAvatar';
// import { useChat } from "../../contexts/ChatContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


interface JobListItemProps {
  job: JobListing;
  onApplySuccess?: () => void;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
}

interface PaginatedJobListProps {
  jobs: JobListing[];
  itemsPerPage?: number;
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
        // Get auth token
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch user info
        const userRes = await fetch(`/api/users/${userId}`, {
          headers
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setFirstName(userData?.data?.first_name || '');
          setLastName(userData?.data?.last_name || '');
        }
        // Fetch user photo
        const photoRes = await fetch(`/api/photos/${userId}`, {
          headers
        });
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

const JobListItem: React.FC<JobListItemProps> = ({ job, onApplySuccess, onJobStatusUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { user } = useAuth();
  const { showToast } = useToast();
  // const { openConversation } = useChat();
  // Use dynamic userId for avatar (default to employer_user_id)
  const avatarUserId = job.employer_user_id; // You can change this to any userId you want to display
  const { photoUrl, firstName, lastName } = useUserAvatarInfo(avatarUserId);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const handleApply = async (resume: File | null, coverLetter: string) => {
    setIsSubmitting(true);
    setError(null);
  
    try {
      // 1. Verify token exists and is valid
      const rawToken = localStorage.getItem("token");
      if (!rawToken) {
        throw new Error("Please log in to apply");
      }
  
      // 2. Create form data
      const formData = new FormData();
      formData.append("job_listing_id", job.id.toString());
      formData.append("employer_id", job.employer_id.toString());
      formData.append("cover_letter", coverLetter || "");
      if (resume) {
        formData.append("resume", resume);
      }
  
      // 3. Make API call
      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${rawToken.trim()}` // Ensure proper formatting
        },
        body: formData,
      });
  
      // 4. Handle response
      if (!response.ok) {
        const errorData = await response.json();
        
        // Create a mock error object for the error handler
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
  
      // 5. Success handling
      showToast({
        type: 'success',
        title: 'Application Submitted',
        message: `Your application for "${job.title}" has been submitted successfully!`,
        autoHide: true,
        autoHideDelay: 4000
      });
      
      setIsApplyModalOpen(false);
      
      // Update job status to "applied"
      if (onJobStatusUpdate) {
        onJobStatusUpdate(job.id, "applied");
      }
      
      if (onApplySuccess) onApplySuccess();
    } catch (err) {
      // 6. Error handling
      const errorInfo = handleJobApplicationError(err);
      showToast(errorInfo);
      setError(errorInfo.message);
      
      // 7. Special case for auth errors
      if (errorInfo.message.toLowerCase().includes("log in")) {
        // Optionally clear invalid token
        localStorage.removeItem("token");
        // Consider redirecting to login
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleMessageClick = async () => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     console.log("No token, not logged in");
  //     return;
  //   }
  //   const response = await fetch("/api/messages/conversations", {
  //     method: "POST",
  //     headers: {
  //       "Authorization": `Bearer ${token}`,
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       participant2_id: job.employer_user_id
  //     })
  //   });
  //   if (!response.ok) {
  //     console.log("Failed to create/get conversation");
  //     return;
  //   }
  //   const data = await response.json();
  //   const conversationId = data.data.id;
  //   console.log("Opening conversation:", conversationId);
  //   openConversation(conversationId);
  // };

  return (
    <>
      <li className="border-b border-gray-200 last:border-b-0">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <UserAvatar
                photoUrl={photoUrl ? `${API_BASE_URL}${photoUrl}` : undefined}
                firstName={firstName}
                lastName={lastName}
                size="md"
                className="flex-shrink-0 mt-1 mr-2"
              />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-600">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                {(typeof job.company === "string"
    ? job.company
    : job.company?.name || "Unknown Company")} • {job.location} • {job.work_mode}
                </p>
                {/* Applicant count display */}
                {typeof (job as any).applicants !== 'undefined' && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <FaUserFriends className="mr-1" />
                    {(job as any).applicants} applicant{(job as any).applicants === 1 ? '' : 's'}
                  </p>
                )}
                {(job as any).hrFirstName || (job as any).hrLastName ? (
                  <p className="text-xs text-gray-500 mt-1">
                    HR: {((job as any).hrFirstName ?? '')} {((job as any).hrLastName ?? '')}
                  </p>
                ) : null}
                {/* {job.logo_path && (
                  <p className="text-xs text-gray-400 mt-1">
                    Logo URL: {job.logo_path}
                  </p>
                )} */}
              </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex flex-col items-end">
              {/* <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                {job.match}% Match
              </span> */}
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
              {job.skills.map((skillItem, i) => (
                <span
                  key={i}
                  className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full"
                  title={`${
                    skillItem.is_required ? "Required" : "Optional"
                  } skill (Level ${skillItem.importance_level})`}
                >
                  {skillItem.name}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 flex space-x-3">
            {job.status === "new" ? (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                disabled={isSubmitting}
                className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50' : ''}`}
              >
                {isSubmitting ? 'Applying...' : 'Apply Now'}
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
              onClick={() => setIsMessageModalOpen(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaComments className="mr-1" />
              Message
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Details
            </button>
          </div>
        </div>
      </li>

      {isModalOpen && (
        <JobDescriptionModal
          job={job}
          onClose={() => setIsModalOpen(false)}
          onSaveJob={() => {}}
          onUnsaveJob={() => {}}
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

export const PaginatedJobList: React.FC<PaginatedJobListProps> = ({
  jobs,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gray-200">
        {currentJobs.map((job) => (
          <JobListItem key={job.id} job={job} />
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, jobs.length)}
                </span>{" "}
                of <span className="font-medium">{jobs.length}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? "bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <FaChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListItem;