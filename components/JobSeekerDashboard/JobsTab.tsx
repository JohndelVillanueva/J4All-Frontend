import React, { useState, useEffect } from "react";
import { FaBriefcase, FaSearch } from "react-icons/fa";
import { JobListing } from "../types/types";
import JobListItem from "./JobListItem";
import JobDetailsPanel from "./JobDetailsPanel";

interface JobsTabProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  jobListings: JobListing[];
  refreshJobs?: () => void;
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
}

const JobsTab: React.FC<JobsTabProps> = ({ 
  searchTerm, 
  onSearchChange, 
  jobListings,
  refreshJobs,
  onJobStatusUpdate
}) => {
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("All Job Types");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isCheckingSavedStatus, setIsCheckingSavedStatus] = useState(false);

  // Check saved status for all jobs when component mounts or job listings change
  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || jobListings.length === 0) return;

      setIsCheckingSavedStatus(true);
      try {
        // Fetch all saved jobs
        const response = await fetch("/api/saved-jobs", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Create a Set of saved job IDs for quick lookup
            const savedIds = new Set<string>(data.data.map((job: any) => String(job.id)));
setSavedJobIds(savedIds);
            
            // Update parent component with saved statuses
            if (onJobStatusUpdate) {
              data.data.forEach((savedJob: any) => {
                onJobStatusUpdate(String(savedJob.id), "saved");
              });
            }
          }
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      } finally {
        setIsCheckingSavedStatus(false);
      }
    };

    checkSavedStatus();
  }, [jobListings.length]); // Re-run when job listings length changes

  const handleApplySuccess = () => {
    if (refreshJobs) {
      refreshJobs();
    }
  };

  const handleViewDetails = async (job: JobListing) => {
    setIsLoadingJob(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSelectedJob(job);
    setIsLoadingJob(false);
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
  };

  const handleJobStatusUpdate = (jobId: string, newStatus: "new" | "applied" | "saved") => {
    // Update local saved job IDs
    if (newStatus === "saved") {
      setSavedJobIds(prev => new Set(prev).add(jobId));
    } else if (newStatus === "new") {
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
    
    // Pass to parent
    if (onJobStatusUpdate) {
      onJobStatusUpdate(jobId, newStatus);
    }
  };

  // Merge saved status into job listings
  const jobListingsWithStatus = jobListings.map(job => ({
    ...job,
    status: savedJobIds.has(String(job.id)) ? "saved" as const : job.status
  }));

  const filteredJobs = jobListingsWithStatus?.filter((job) => {
    if (!job) return false;
    
    if (jobTypeFilter !== "All Job Types") {
      const jobType = job.type || job.jobType || "";
      if (jobType.toLowerCase() !== jobTypeFilter.toLowerCase()) {
        return false;
      }
    }
    
    const safeTitle = job.title?.toLowerCase() || "";
    const safeCompany = typeof job.company === 'string' ? job.company.toLowerCase() : job.company?.name?.toLowerCase() || "";
    const safeSkills = job.skills?.map(skillObj => skillObj?.name?.toLowerCase() || "") || [];
    
    return (
      safeTitle.includes(searchTerm.toLowerCase()) ||
      safeCompany.includes(searchTerm.toLowerCase()) ||
      safeSkills.some(skill => skill.includes(searchTerm.toLowerCase()))
    );
  }) || [];

  return (
    <div>
      {/* Fixed Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Find Your Next Opportunity</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBriefcase className="text-gray-400" />
            </div>
            <select 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
            >
              <option>All Job Types</option>
              <option>Full-time</option>
              <option>Contract</option>
              <option>Part-time</option>
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by skills..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading indicator for saved status check */}
      {isCheckingSavedStatus && (
        <div className="mb-4 text-sm text-gray-500 text-center">
          Checking saved jobs...
        </div>
      )}

      {/* Split View Container */}
      <div className="flex gap-6">
        {/* Jobs List Section */}
        <div className={`transition-all duration-300 ${selectedJob || isLoadingJob ? 'w-2/5' : 'w-full'}`}>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💼</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">
                  {jobListings.length === 0 
                    ? "No job listings available." 
                    : "No jobs match your current filters. Try adjusting your search criteria."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <JobListItem 
                    key={job.id} 
                    job={job} 
                    onApplySuccess={handleApplySuccess}
                    onJobStatusUpdate={handleJobStatusUpdate}
                    onViewDetails={handleViewDetails}
                    isSelected={selectedJob?.id === job.id}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Job Details Panel or Loading State */}
        {(selectedJob || isLoadingJob) && (
          <div className="w-3/5">
            {isLoadingJob ? (
              <div className="rounded-lg flex flex-col border border-gray-200 h-[calc(100vh-3rem)]">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-500 font-light">Loading job details...</p>
                  </div>
                </div>
              </div>
            ) : selectedJob ? (
              <JobDetailsPanel 
                job={selectedJob} 
                onClose={handleCloseDetails}
                onApplySuccess={handleApplySuccess}
                onJobStatusUpdate={handleJobStatusUpdate}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsTab;