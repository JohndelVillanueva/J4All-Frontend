import React, { useEffect, useState } from "react";
import {
  FaChartLine,
  FaBriefcase,
  FaStar,
  FaSyncAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaGlobe,
  FaLinkedin
} from "react-icons/fa";
import { Application, JobListing, StatItem } from "../types/types";
import JobDescriptionModal from "./JobDescriptionModal";
import ApplyModal from "./ApplyModal";
import UserAvatar from '../UserAvatar';
import { useToast } from "../ToastContainer";
import { handleJobApplicationError } from "../../src/utils/errorHandler";
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

// Hook to fetch employer profile data
// function useEmployerProfile(employerId?: number) {
//   const [employerProfile, setEmployerProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   React.useEffect(() => {
//     if (!employerId) return;
    
//     const fetchEmployerProfile = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         if (!token) return;

//         const response = await fetch(`/api/employers/${employerId}`, {
//           headers: {
//             "Authorization": `Bearer ${token}`
//           }
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setEmployerProfile(data.data);
//         }
//       } catch (error) {
//         console.error("Error fetching employer profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployerProfile();
//   }, [employerId]);

//   return { employerProfile, loading };
// }

interface DashboardTabProps {
  stats: StatItem[];
  jobListings: JobListing[];
  applications: Application[];
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
}

// Extended JobListing interface for recommendations
interface RecommendedJob extends JobListing {
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  stats,
  jobListings,
  applications,
  onJobStatusUpdate,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyJob, setApplyJob] = useState<JobListing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [showEmployerProfile, setShowEmployerProfile] = useState(false);
  const { showToast } = useToast();

  // Fetch recommended jobs on component mount
  useEffect(() => {
    fetchRecommendedJobs();
  }, [applications]); // Re-fetch when applications change

  // Function to check if a job has been applied to
  const getJobStatus = (jobId: string): "new" | "applied" => {
    const hasApplied = applications.some(app => String(app.jobId) === String(jobId));
    return hasApplied ? "applied" : "new";
  };

  const fetchRecommendedJobs = async () => {
    try {
      setLoadingRecommendations(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token available for recommendations");
        setLoadingRecommendations(false);
        return;
      }

      const response = await fetch("/api/recommendations/jobs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          limit: 3,
          matchThreshold: 30 // Lowered threshold to show more jobs
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      console.log('=== RAW API RESPONSE ===');
      console.log('Full data:', data);
      console.log('First job item:', data.data?.[0]);
      console.log('First job object:', data.data?.[0]?.job);
      console.log('Employer info:', data.data?.[0]?.job?.employer);
      console.log('========================');
      
      if (data.success && data.data) {
        const recommendedJobsWithStatus = data.data.map((item: any) => {
          const jobStatus = getJobStatus(item.job.id.toString());
          
          // Try multiple possible locations for employer_user_id
          const employerUserId = item.job.employer_user_id 
            || item.job.employer?.user_id 
            || item.job.user_id
            || item.job.employer?.id
            || item.job.created_by;
          
          console.log('Processing job:', {
            jobId: item.job.id,
            jobTitle: item.job.job_title,
            employerUserId: employerUserId,
            rawEmployer: item.job.employer,
            allPossibleIds: {
              employer_user_id: item.job.employer_user_id,
              'employer.user_id': item.job.employer?.user_id,
              user_id: item.job.user_id,
              'employer.id': item.job.employer?.id,
              created_by: item.job.created_by
            }
          });
          
          return {
            ...item.job,
            matchScore: item.score,
            matchedSkills: item.matchedSkills,
            missingSkills: item.missingSkills,
            status: jobStatus,
            title: item.job.job_title,
            location: item.job.job_location,
            salary: item.job.salary_range_min && item.job.salary_range_max 
              ? `₱${item.job.salary_range_min.toLocaleString()} - ₱${item.job.salary_range_max.toLocaleString()}`
              : "Negotiable",
            type: item.job.job_type,
            posted: new Date(item.job.posted_date).toLocaleDateString(),
            skills: item.job.required_skills?.map((rs: any) => ({
              name: rs.skill_name,
              is_required: rs.is_required,
              importance_level: rs.importance_level
            })) || [],
            // Include employer information - CRITICAL: Add employer_user_id
            employer_user_id: employerUserId,
            employer_id: item.job.employer_id,
            employer: item.job.employer,
            hrFirstName: item.job.hrFirstName,
            hrLastName: item.job.hrLastName,
            hrPhoto: item.job.hrPhoto,
            company: item.job.company?.name || item.job.company_name || 'Unknown Company'
          };
        });
        
        console.log('=== TRANSFORMED JOBS ===');
        console.log('Transformed jobs with employer_user_id:', recommendedJobsWithStatus.map((j: { id: any; title: any; employer_user_id: any; }) => ({
          id: j.id,
          title: j.title,
          employer_user_id: j.employer_user_id
        })));
        console.log('========================');
        setRecommendedJobs(recommendedJobsWithStatus);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      // Don't show error toast for recommendations to avoid annoying users
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleViewEmployerProfile = (job: JobListing) => {
    if (job.employer) {
      setSelectedEmployer(job.employer);
      setShowEmployerProfile(true);
    }
  };

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

      // Refresh recommendations after applying to update the status
      fetchRecommendedJobs();
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

      {/* Recommended Jobs - Now using AI-powered recommendations */}
      <RecommendedJobsSection
        title="Recommended For You"
        jobs={recommendedJobs}
        loading={loadingRecommendations}
        className="mb-8"
        onJobStatusUpdate={onJobStatusUpdate}
        onViewDetails={setSelectedJob}
        onApply={setApplyJob}
        onViewEmployerProfile={handleViewEmployerProfile}
        onRefresh={fetchRecommendedJobs}
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

      {/* Employer Profile Modal */}
      {showEmployerProfile && selectedEmployer && (
        <EmployerProfileModal
          employer={selectedEmployer}
          onClose={() => {
            setShowEmployerProfile(false);
            setSelectedEmployer(null);
          }}
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

// Employer Profile Modal Component
const EmployerProfileModal: React.FC<{
  employer: any;
  onClose: () => void;
}> = ({ employer, onClose }) => {
  // Try to get HR info from employer object first
  const hrFirstName = employer.contact_first_name || employer.first_name || '';
  const hrLastName = employer.contact_last_name || employer.last_name || '';
  const hrPhoto = employer.contact_photo || employer.photo || null;
  
  // Only fetch if we don't have the data
  const shouldFetchFromAPI = !hrFirstName && !hrLastName && employer.user_id;
  const { photoUrl: fetchedPhotoUrl, firstName: fetchedFirstName, lastName: fetchedLastName } = 
    useEmployerAvatarInfo(shouldFetchFromAPI ? employer.user_id : undefined);
  
  const photoUrl = hrPhoto || fetchedPhotoUrl;
  const firstName = hrFirstName || fetchedFirstName;
  const lastName = hrLastName || fetchedLastName;

  // Safe access to logo path
  const companyLogo = employer.logo_path || employer.logo || employer.company_logo;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-semibold text-gray-900">Company Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Company Header */}
          <div className="flex items-start space-x-4">
            {companyLogo ? (
              <img
                src={`${API_BASE_URL}${companyLogo}`}
                alt={`${employer.company_name} logo`}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold text-xl border border-gray-200">
                {employer.company_name?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{employer.company_name}</h2>
              {employer.industry && (
                <p className="text-gray-600">{employer.industry}</p>
              )}
              {employer.company_size && (
                <p className="text-sm text-gray-500">{employer.company_size} employees</p>
              )}
            </div>
          </div>

          {/* Company Description */}
          {employer.company_description && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">About Us</h4>
              <p className="text-gray-700 leading-relaxed">{employer.company_description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Company Details</h4>
              <div className="space-y-2">
                {employer.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaGlobe className="w-4 h-4 mr-2 text-gray-400" />
                    <a 
                      href={employer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {employer.website}
                    </a>
                  </div>
                )}
                {employer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                    <a 
                      href={`mailto:${employer.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {employer.email}
                    </a>
                  </div>
                )}
                {employer.phone_number && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <a 
                      href={`tel:${employer.phone_number}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {employer.phone_number}
                    </a>
                  </div>
                )}
                {employer.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{employer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Person</h4>
              <div className="flex items-center space-x-3">
                <UserAvatar
                  photoUrl={photoUrl ? `${API_BASE_URL}${photoUrl}` : undefined}
                  firstName={firstName}
                  lastName={lastName}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Contact Person'}
                  </p>
                  <p className="text-sm text-gray-500">HR / Recruiter</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employer.founded_year && (
              <div>
                <h5 className="text-sm font-medium text-gray-500">Founded</h5>
                <p className="text-sm text-gray-900">{employer.founded_year}</p>
              </div>
            )}
            {employer.industry && (
              <div>
                <h5 className="text-sm font-medium text-gray-500">Industry</h5>
                <p className="text-sm text-gray-900">{employer.industry}</p>
              </div>
            )}
            {employer.company_size && (
              <div>
                <h5 className="text-sm font-medium text-gray-500">Company Size</h5>
                <p className="text-sm text-gray-900">{employer.company_size}</p>
              </div>
            )}
            {employer.company_type && (
              <div>
                <h5 className="text-sm font-medium text-gray-500">Company Type</h5>
                <p className="text-sm text-gray-900">{employer.company_type}</p>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(employer.linkedin_url || employer.facebook_url || employer.twitter_url) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                {employer.linkedin_url && (
                  <a
                    href={employer.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// New Recommended Jobs Section with AI-powered recommendations
const RecommendedJobsSection: React.FC<{
  title: string;
  jobs: RecommendedJob[];
  loading: boolean;
  className?: string;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
  onViewDetails?: (job: JobListing) => void;
  onApply?: (job: JobListing) => void;
  onViewEmployerProfile?: (job: JobListing) => void;
  onRefresh?: () => void;
}> = ({ title, jobs, loading, className, onViewDetails, onApply, onViewEmployerProfile, onRefresh }) => (
  <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered matches based on your skills and preferences
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <FaSyncAlt className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
    <div className="bg-white overflow-hidden">
      {loading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FaStar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>Complete your profile to get personalized job recommendations</p>
          <p className="text-sm mt-2">Add your skills, desired job title, and location preferences</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <RecommendedJobListItem 
              key={job.id} 
              job={job} 
              onViewDetails={onViewDetails} 
              onApply={onApply} 
              onViewEmployerProfile={onViewEmployerProfile}
            />
          ))}
        </ul>
      )}
    </div>
  </div>
);

// Special Job List Item for Recommended Jobs with match score
const RecommendedJobListItem: React.FC<{ 
  job: RecommendedJob; 
  onViewDetails?: (job: JobListing) => void; 
  onApply?: (job: JobListing) => void; 
  onViewEmployerProfile?: (job: JobListing) => void;
}> = ({ job, onViewDetails, onApply, onViewEmployerProfile }) => {
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Unknown Company';
  
  // Get company logo from employer data
  const companyLogo = job.employer?.logo_path;

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Company Logo Display */}
            <div className="flex-shrink-0">
              {companyLogo ? (
                <img
                  src={`${API_BASE_URL}${companyLogo}`}
                  alt={`${companyName} logo`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                  {companyName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-blue-600">{job.title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">
                  {companyName} • {job.location}
                </p>
                {/* {job.employer && (
                  <button
                    onClick={() => onViewEmployerProfile && onViewEmployerProfile(job)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    View Company Profile
                  </button>
                )} */}
              </div>
              {/* Show matched skills */}
              {job.matchedSkills && job.matchedSkills.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {job.matchedSkills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.matchedSkills && job.matchedSkills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{job.matchedSkills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex flex-col items-end">
            <div className="flex items-center">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
                {job.work_mode || 'Remote'}
              </span>
              {job.matchScore && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchColor(job.matchScore)}`}>
                  {job.matchScore}% Match
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 mt-1">{job.posted}</span>
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
            {job.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full"
                title={`${skill.is_required ? "Required" : "Optional"} skill (Level ${skill.importance_level})`}
              >
                {skill.name}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-500">
                +{job.skills.length - 3} more
              </span>
            )}
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
          {job.employer && (
            <button
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onViewEmployerProfile && onViewEmployerProfile(job)}
            >
              <FaBuilding className="mr-1 h-3 w-3" />
              Company
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

// Keep the rest of your existing components unchanged...
// [ApplicationsSection, ApplicationListItem, ProgressBar, etc. remain the same]

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
          const job = jobListings.find((j: JobListing) => String(j.id) === String(app.jobId));
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
  description: "No description available.", // Add this missing property
});

const ApplicationListItem: React.FC<{
  application: Application;
  job: JobListing;
}> = ({ application, job }) => {
  // Try to get HR info from job object first
  const hrFirstName = (job as any).hrFirstName || '';
  const hrLastName = (job as any).hrLastName || '';
  const hrPhoto = (job as any).hrPhoto || null;
  
  // Only fetch from API if we don't have HR info in the job object
  const shouldFetchFromAPI = !hrFirstName && !hrLastName && job.employer_user_id;
  const { photoUrl: fetchedPhotoUrl, firstName: fetchedFirstName, lastName: fetchedLastName } = 
    useEmployerAvatarInfo(shouldFetchFromAPI ? job.employer_user_id : undefined);
  
  // Use job data if available, otherwise use fetched data
  const photoUrl = hrPhoto || fetchedPhotoUrl;
  const firstName = hrFirstName || fetchedFirstName;
  const lastName = hrLastName || fetchedLastName;

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