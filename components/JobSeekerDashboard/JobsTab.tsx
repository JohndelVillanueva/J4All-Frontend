import React from "react";
import { FaBriefcase, FaSearch } from "react-icons/fa";
import { JobListing } from "../types/types";
import JobListItem from "./JobListItem";

interface JobsTabProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  jobListings: JobListing[];
  refreshJobs?: () => void; // Add this prop
  onJobStatusUpdate?: (jobId: string, newStatus: "new" | "applied" | "saved") => void;
}

const JobsTab: React.FC<JobsTabProps> = ({ 
  searchTerm, 
  onSearchChange, 
  jobListings,
  refreshJobs,
  onJobStatusUpdate
}) => {
  // Add null checks and safe access to properties
  const handleApplySuccess = () => {
    // Refresh job listings or show success message
    if (refreshJobs) {
      refreshJobs();
    }
  };

  const filteredJobs = jobListings?.filter((job) => {
    if (!job) return false;
    
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Find Your Next Opportunity</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBriefcase className="text-gray-400" />
            </div>
            <select className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
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

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredJobs.map((job) => (
            <JobListItem 
              key={job.id} 
              job={job} 
              onApplySuccess={handleApplySuccess}
              onJobStatusUpdate={onJobStatusUpdate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JobsTab;