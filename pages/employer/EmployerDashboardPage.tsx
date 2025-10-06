import React, { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaUserTie,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUserFriends,
  FaSort,
} from "react-icons/fa";
// import DynamicHeader from "../../components/JobSeekerDashboard/DynamicHeader";
import { useNavigate } from "react-router-dom";
import {
  UserData,
  Applicant,
} from "../../components/types/types";
import CreatePositionModal from "../../components/EmployerDashboard/CreatePositionModal";
import EmployerMessageModal from "../../components/EmployerDashboard/EmployerMessageModal";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from '../../components/UserAvatar';
import { useToast } from "../../components/ToastContainer";
import { handleApiError } from "../../src/utils/errorHandler";
import ScheduleInterviewModal from '../../components/EmployerDashboard/ScheduleInterviewModal';
import ApplicantProfileModal from '../profile/ApplicantProfileModal';
import EditEmployerAccountModal from '../profile/EditEmployerAccountModal';
import Header from '../../components/Header';
import { MdAutoDelete } from "react-icons/md";

interface JobPosting {
  id: number;
  job_title: string;
  job_description: string;
  job_requirements: string;
  job_location: string;
  job_type: string;
  work_mode: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  expiration_date?: string;
  posted_date: string;
  status: 'active' | 'closed';
  applicants: number;
  required_skills: {
    skill_name: string;
    is_required: boolean;
    importance_level: number;
    category?: string;
  }[];
}

// Add a simple Tooltip component if not present
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <span className="relative group">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50 whitespace-nowrap shadow-lg">
      {text}
    </span>
  </span>
);

const EmployerDashboardPage = () => {

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleApplicant, setScheduleApplicant] = useState<Applicant | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedApplicantForProfile, setSelectedApplicantForProfile] = useState<Applicant | null>(null);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('date'); // default sort by applied date
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [positionFilter, setPositionFilter] = useState<string>('All Positions');
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<Applicant[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");
  const [editEmployerAccountOpen, setEditEmployerAccountOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Add handleDeleteJob function here
  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete job posting');
      }

      showToast({ type: 'success', message: 'Job posting deleted successfully!', autoHide: true, autoHideDelay: 3000 });
      
      // Refresh job listings
      fetchJobPostings();

    } catch (error) {
      console.error('Error deleting job posting:', error);
      const errorInfo = handleApiError(error);
      showToast(errorInfo);
    }
  };

  // Guard: Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Guard: If not authenticated, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    } else if (user) {
      if (user.user_type === "pwd" || user.user_type === "indigenous" || user.user_type === "general") {
        navigate("/ApplicantDashboard");
      } else if (user.user_type === "admin") {
        navigate("/AdminDashboard");
      }
    }
    // eslint-disable-next-line
  }, [user, loading, navigate]);

  // If not authenticated, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Fetch applicants from backend
  const fetchApplicants = async () => {
    setIsLoadingApplicants(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/employer-applicants', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applicants');
      }

      const data = await response.json();
      if (data.success) {
        setApplicants(data.data);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      const errorInfo = handleApiError(err);
      showToast(errorInfo);
      setApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const openPositions = jobPostings.filter(job => job.status === "active");

  const metrics = [
    { title: "Open Positions", value: openPositions.length, change: "", trend: "up" },
    { title: "Total Applicants", value: applicants.length, change: "", trend: "up" },
    { title: "Interview Rate", value: "32%", change: "", trend: "up" },
    { title: "Hire Rate", value: "18%", change: "", trend: "down" },
  ];

  const filteredApplicants = applicants.filter((applicant) => {
    // Search filter
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    // Status filter
    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Under Review' && applicant.status === 'review') ||
      (statusFilter === 'Interview' && applicant.status === 'interview') ||
      (statusFilter === 'Hired' && applicant.status === 'hired') ||
      (statusFilter === 'Rejected' && applicant.status === 'rejected') ||
      (statusFilter === 'Pending' && applicant.status === 'pending');
    // Position filter
    const matchesPosition =
      positionFilter === 'All Positions' ||
      applicant.position === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Sorting logic
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    if (sortBy === 'status') {
      // Custom order: hired < interview < review < pending < rejected
      const order = { hired: 0, interview: 1, review: 2, pending: 3, rejected: 4 };
      return (order[a.status as keyof typeof order] ?? 99) - (order[b.status as keyof typeof order] ?? 99);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Default: sort by applied date (descending)
    return new Date(b.applied).getTime() - new Date(a.applied).getTime();
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      try {
        if (!user.id || !token) {
          throw new Error("Please login to access this page");
        }

        const response = await fetch(`/api/users/${user.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const userData = await response.json();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Fetch error:", err);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, navigate]);

  // Fetch job postings from backend
  const fetchJobPostings = async () => {
    setIsLoadingJobs(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/getJoblisting', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }

      const data = await response.json();
      if (data.success) {
        setJobPostings(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch job postings');
      }
    } catch (err) {
      console.error('Error fetching job postings:', err);
      const errorInfo = handleApiError(err);
      showToast(errorInfo);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Fetch job postings on mount
  useEffect(() => {
    fetchJobPostings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (activeTab === "applicants") {
      fetchApplicants();
    }
  }, [activeTab]);

  // Fetch applicants on mount
  useEffect(() => {
    fetchApplicants();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchEmployerId = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/employer/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setEmployerId(data.employer.id);
        } else {
          showToast({ type: 'error', message: data.error || 'Employer not found for this user.', autoHide: true, autoHideDelay: 3000 });
        }
      } catch (err) {
        showToast({ type: 'error', message: 'Failed to fetch employer info.', autoHide: true, autoHideDelay: 3000 });
      }
    };
    fetchEmployerId();
  }, [user]);

  type Skill = {
  skill_name: string;
  is_required: boolean;
  importance_level: number;
  category?: string;
};

const handleCreateJobPosting = async (data: {
  job_title: string;
  job_description: string;
  job_requirements: string;
  job_location: string;
  job_type: string;
  work_mode: string;
  salary_range_min?: number;
  salary_range_max?: number;
  expiration_date?: string;
  required_skills: Skill[];
  idempotencyKey?: string;
}) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Prepare the payload with proper skill structure
    const payload = {
      job_title: data.job_title,
      job_description: data.job_description,
      job_requirements: data.job_requirements,
      job_location: data.job_location,
      job_type: data.job_type,
      work_mode: data.work_mode,
      salary_range_min: data.salary_range_min,
      salary_range_max: data.salary_range_max,
      expiration_date: data.expiration_date,
      required_skills: data.required_skills.map(skill => ({
        skill_name: skill.skill_name,
        category: skill.category || 'Technical',
        is_required: skill.is_required !== false,
        importance_level: skill.importance_level || 1
      })),
      idempotencyKey: data.idempotencyKey
    };

    console.log('Submitting job with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/createJob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': data.idempotencyKey || ''
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Server error:', responseData);
      
      // Handle duplicate job case specifically
      if (response.status === 409) {
        console.log('Duplicate job detected, refreshing listings...');
        
        try {
          const jobsResponse = await fetch('/api/getJoblisting', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            if (jobsData.success) {
              console.log('Successfully refreshed job listings');
              setJobPostings(jobsData.data);
            }
          } else {
            console.error('Failed to refresh job listings');
          }
        } catch (refreshError) {
          console.error('Error refreshing job listings:', refreshError);
        }
        
        throw new Error(responseData.message || 'Job already exists');
      }
      
      throw new Error(responseData.message || 'Request failed');
    }

    console.log('Job created successfully, refreshing listings...');

    // Refresh job listings after successful creation
    try {
      const jobsResponse = await fetch('/api/getJoblisting', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        if (jobsData.success) {
          console.log('Successfully updated job listings');
          setJobPostings(jobsData.data);
        }
      } else {
        console.error('Failed to refresh job listings after creation');
      }
    } catch (refreshError) {
      console.error('Error refreshing job listings:', refreshError);
    }

    return responseData;

  } catch (error) {
    console.error('Error creating job posting:', error);
    
    const errorInfo = handleApiError(error);
    showToast(errorInfo);
    
    throw error;
  }
};
console.log('EmployerDashboard mounted');

  // Debug: Show modal state
  console.log("Render: isMessageModalOpen", isMessageModalOpen, "selectedApplicant", selectedApplicant);

  // Handler for scheduling interview
  const handleScheduleInterview = (applicant: Applicant) => {
    setScheduleApplicant(applicant);
    setIsScheduleModalOpen(true);
  };

  const fetchJobSeekerId = async (userId: number) => {
    const res = await fetch(`/api/jobseeker/${userId}`);
    const data = await res.json();
    if (data.success) return data.jobSeeker.id;
    throw new Error('JobSeeker not found');
  };

  // Handler for submitting interview schedule
  const handleSubmitInterview = async (data: { date: string; time: string; notes?: string; location: string }) => {
    if (!scheduleApplicant || !user || !employerId) return;

    let seekerId;
    try {
      seekerId = await fetchJobSeekerId(scheduleApplicant.user_id);
    } catch (err) {
      showToast({ type: 'error', message: 'JobSeeker not found for this applicant.', autoHide: true, autoHideDelay: 3000 });
      return;
    }

    const payload = {
      applicationId: scheduleApplicant.applicationId,
      employerId,
      seekerId, // <-- JobSeeker table's id!
      date: data.date,
      time: data.time,
      notes: data.notes,
      location: data.location, // <-- Ensure location is included
    };

    try {
      const res = await fetch('/api/interview/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: 'Interview scheduled!', autoHide: true, autoHideDelay: 3000 });
        setIsScheduleModalOpen(false);
        setScheduleApplicant(null);
        // Optionally refresh applicants or UI here
      } else {
        showToast({ type: 'error', message: result.error || 'Failed to schedule interview', autoHide: true, autoHideDelay: 3000 });
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Network error', autoHide: true, autoHideDelay: 3000 });
    }
  };

  const handleUpdateStatus = async (applicant: Applicant, newStatus: string) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`/api/job-applications/${applicant.applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus.toUpperCase(),
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast({ type: 'success', message: `Applicant marked as ${newStatus}`, autoHide: true, autoHideDelay: 3000 });
        fetchApplicants(); // Refresh list
      } else {
        showToast({ type: 'error', message: result.error || 'Failed to update status', autoHide: true, autoHideDelay: 3000 });
      }
    } catch (err) {
      showToast({ type: 'error', message: 'Network error', autoHide: true, autoHideDelay: 3000 });
    }
  };

  // Handler for editing job posting
  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleUpdateJobPosting = async (data: {
    job_title: string;
    job_description: string;
    job_requirements: string;
    job_location: string;
    job_type: string;
    work_mode: string;
    salary_range_min?: number;
    salary_range_max?: number;
    expiration_date?: string;
    required_skills: Skill[];
    idempotencyKey?: string;
  }) => {
    if (!editingJob) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const payload = {
        job_title: data.job_title,
        job_description: data.job_description,
        job_requirements: data.job_requirements,
        job_location: data.job_location,
        job_type: data.job_type,
        work_mode: data.work_mode,
        salary_range_min: data.salary_range_min,
        salary_range_max: data.salary_range_max,
        expiration_date: data.expiration_date,
        required_skills: data.required_skills.map(skill => ({
          skill_name: skill.skill_name,
          category: skill.category || 'Technical',
          is_required: skill.is_required !== false,
          importance_level: skill.importance_level || 1
        }))
      };

      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update job posting');
      }

      showToast({ type: 'success', message: 'Job posting updated successfully!', autoHide: true, autoHideDelay: 3000 });
      setIsEditModalOpen(false);
      setEditingJob(null);
      
      // Refresh job listings
      fetchJobPostings();

    } catch (error) {
      console.error('Error updating job posting:', error);
      const errorInfo = handleApiError(error);
      showToast(errorInfo);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Rich background gradient and floating shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200" />
        {/* Floating blurred circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 opacity-30 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 opacity-30 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-200 opacity-20 rounded-full filter blur-2xl animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
      {/* Main dashboard content (z-10) */}
      <div className="relative z-10">
        <Header onEmployerEditAccount={() => {
          console.log('Header requested to open employer edit modal');
          setEditEmployerAccountOpen(true);
        }} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaChartLine className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("positions")}
                className={`${
                  activeTab === "positions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaBriefcase className="inline mr-2" />
                Job Positions
              </button>
              <button
                onClick={() => setActiveTab("applicants")}
                className={`${
                  activeTab === "applicants"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaUserTie className="inline mr-2" />
                Applicants
              </button>
              {/* <button
                onClick={() => setActiveTab("messages")}
                className={`${
                  activeTab === "messages"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaEnvelope className="inline mr-2" />
                Messages
              </button> */}
            </nav>
          </div>

          <div className="py-6">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Recruitment Overview
                </h2>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="bg-white overflow-hidden shadow rounded-lg"
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                            <FaChartLine className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {metric.title}
                            </dt>
                            <div className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">
                                {metric.value}
                              </div>
                              <div
                                className={`ml-2 flex items-baseline text-sm font-semibold ${
                                  metric.trend === "up"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {metric.change}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Hiring Activity
                    </h3>
                  </div>
                  <div className="bg-white overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {applicants.slice(0, 4).map((applicant) => (
                        <li key={applicant.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-blue-600 truncate">
                                  {applicant.name}
                                </p>
                                <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                                  for {applicant.position}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                {applicant.status === "hired" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Hired
                                  </span>
                                )}
                                {applicant.status === "interview" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Interview
                                  </span>
                                )}
                                {applicant.status === "pending" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Pending
                                  </span>
                                )}
                                {applicant.status === "rejected" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Rejected
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <FaBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  {applicant.experience} experience
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  Applied on {applicant.applied}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                {applicant.skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="bg-white shadow rounded-lg p-6 mb-8 flex flex-col items-center">
                <UserAvatar
                  photoUrl={currentUser?.photo ? `${API_BASE_URL}${currentUser.photo}` : undefined}
                  firstName={currentUser?.first_name}
                  lastName={currentUser?.last_name}
                  size="xl"
                  className="mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h2>
                <span className="text-blue-700 font-semibold text-sm mb-2 capitalize">
                  {currentUser?.user_type === 'employer' ? 'Employer' : ''}
                </span>
                <button
                  onClick={() => setEditEmployerAccountOpen(true)}
                  className="mt-2 inline-flex items-center px-5 py-2.5 border border-blue-600 text-blue-700 font-semibold rounded-lg shadow-sm bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  Edit Account
                </button>
              </div>
            )}

            {activeTab === "positions" && (
              <>
                {/* Floating Deactivate Expired Jobs Button */}
                <div className="fixed bottom-8 left-8 z-50">
                  <Tooltip text="Deactivate Expired Jobs">
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                        const res = await fetch('/api/jobs/deactivate-expired', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await res.json();
                        if (data.success) {
                          showToast({ type: 'success', message: `Deactivated ${data.deactivated} expired jobs!` });
                          fetchJobPostings();
                        } else {
                          showToast({ type: 'error', message: 'Failed to deactivate expired jobs.' });
                        }
                      }}
                      className="inline-flex items-center justify-center p-3 border border-transparent rounded-full shadow-lg text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-transparent"
                      type="button"
                    >
                      <MdAutoDelete size={28} />
                    </button>
                  </Tooltip>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Job Positions
                    </h2>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create New Position
                      </button>
                    </div>
                  </div>

                  {isLoadingJobs ? (
                    <div className="flex justify-center items-center py-10">
                      <span className="inline-block animate-spin mr-2">↻</span>
                      Loading job postings...
                    </div>
                  ) : jobPostings.length === 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                      <FaBriefcase className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No job postings
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You haven't posted any jobs yet.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaBriefcase className="-ml-1 mr-2 h-5 w-5" />
                          Create First Job Posting
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <ul className="divide-y divide-gray-200">
                        {jobPostings.map((job) => (
                          <li key={job.id}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <p className="text-lg font-medium text-blue-600 truncate">
                                    {job.job_title}
                                  </p>
                                  {typeof job.applicants !== 'undefined' && (
                                    <span className="inline-flex items-center px-2 py-1 ml-3 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                                      <FaUserFriends className="mr-1" />
                                      {job.applicants} applicant{job.applicants === 1 ? '' : 's'}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                  {job.status === "active" ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Closed
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    Posted on {new Date(job.posted_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <button
                                    className="mr-3 text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                      const applicantsForJob = applicants.filter(a => a.job?.id === job.id);
                                      setSelectedJobApplicants(applicantsForJob);
                                      setSelectedJobTitle(job.job_title);
                                      setIsApplicantsModalOpen(true);
                                    }}
                                  >
                                    View Applicants
                                  </button>
                                  <button 
                                    onClick={() => handleEditJob(job)}
                                    className="mr-3 text-gray-600 hover:text-gray-800"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "applicants" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Applicants
                  </h2>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFilter className="text-gray-400" />
                      </div>
                      <select
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <option>All Statuses</option>
                        <option>Under Review</option>
                        <option>Interview</option>
                        <option>Hired</option>
                        <option>Rejected</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBriefcase className="text-gray-400" />
                      </div>
                      <select
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={positionFilter}
                        onChange={e => setPositionFilter(e.target.value)}
                      >
                        <option>All Positions</option>
                        {/* Dynamically generate unique positions from applicants */}
                        {Array.from(new Set(applicants.map(a => a.position)))
                          .filter(pos => pos && pos !== '')
                          .map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                      </select>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSort className="text-gray-400" />
                      </div>
                      <select
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                      >
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                        <option value="name">Sort by Name</option>
                      </select>
                    </div>
                  </div>
                </div>

                {isLoadingApplicants ? (
                  <div className="flex justify-center items-center py-10">
                    <span className="inline-block animate-spin mr-2">↻</span>
                    Loading applicants...
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                    <FaUserTie className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No applicants
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't received any applications yet.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSearch className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search applicants..."
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {sortedApplicants.map((applicant) => (
                        <li key={applicant.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                  <UserAvatar
                                    photoUrl={applicant.photo ? `${API_BASE_URL}${applicant.photo}` : undefined}
                                    firstName={applicant.name}
                                    lastName={''}
                                    size="sm"
                                    className="flex-shrink-0"
                                  />
                                </div>
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-blue-600">
                                    {applicant.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {applicant.position}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                {applicant.status === "hired" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Hired
                                  </span>
                                )}
                                {applicant.status === "interview" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Interview
                                  </span>
                                )}
                                {applicant.status === "review" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Under Review
                                  </span>
                                )}
                                {applicant.status === "rejected" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Rejected
                                  </span>
                                )}
                                {applicant.status === "pending" && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <FaBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  {applicant.experience} experience
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  Applied on {applicant.applied}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                {applicant.skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3 flex space-x-3">
                              <button 
                                onClick={() => {
                                  setSelectedApplicantForProfile(applicant);
                                  setIsProfileModalOpen(true);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                View Profile
                              </button>
                              <button 
                                onClick={() => {
                                  console.log("Message button clicked", applicant);
                                  setSelectedApplicant(applicant);
                                  setIsMessageModalOpen(true);
                                  setTimeout(() => {
                                    console.log("After set: isMessageModalOpen", isMessageModalOpen, "selectedApplicant", selectedApplicant);
                                  }, 100);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Message
                              </button>
                              {applicant.status === "pending" && (
                                <button 
                                  onClick={() => handleScheduleInterview(applicant)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Schedule Interview
                                </button>
                              )}
                              {applicant.status === "interview" && (
                                <>
                                  <button
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={() => handleUpdateStatus(applicant, "hired")}
                                  >
                                    Mark as Hired
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => handleUpdateStatus(applicant, "rejected")}
                                  >
                                    Mark as Not Hired
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* {activeTab === "messages" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Messages
                </h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Candidate Communications
                    </h3>
                  </div>
                  <div className="bg-white p-6 text-center">
                    <FaEnvelope className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No messages
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any messages with candidates yet.
                    </p>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FaEnvelope className="-ml-1 mr-2 h-5 w-5" />
                        New Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </main>
        <CreatePositionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateJobPosting}
        />
        <CreatePositionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingJob(null);
          }}
          onSubmit={handleUpdateJobPosting}
          editingJob={editingJob}
          isEditing={true}
        />
        {isMessageModalOpen && selectedApplicant && (
          <EmployerMessageModal
            applicant={selectedApplicant}
            onClose={() => {
              setIsMessageModalOpen(false);
              setSelectedApplicant(null);
            }}
            onSendMessage={() => {
              // Optionally refresh data or show success message
              console.log('Message sent successfully');
            }}
          />
        )}
        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={handleSubmitInterview}
          applicantName={scheduleApplicant ? scheduleApplicant.name : ''}
        />
        {isProfileModalOpen && selectedApplicantForProfile && (
          <ApplicantProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => {
              setIsProfileModalOpen(false);
              setSelectedApplicantForProfile(null);
            }}
            applicantUserId={selectedApplicantForProfile.user_id}
          />
        )}
        {isApplicantsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setIsApplicantsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Applicants for {selectedJobTitle}</h2>
              {selectedJobApplicants.length === 0 ? (
                <p className="text-gray-500">No applicants for this job.</p>
              ) : (
                <ul>
                  {selectedJobApplicants.map(applicant => (
                    <li key={applicant.id} className="flex items-center justify-between py-2 border-b">
                      <span>{applicant.name}</span>
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          setSelectedApplicantForProfile(applicant);
                          setIsProfileModalOpen(true);
                          setIsApplicantsModalOpen(false);
                        }}
                      >
                        View Profile
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <EditEmployerAccountModal
          isOpen={editEmployerAccountOpen}
          onClose={() => setEditEmployerAccountOpen(false)}
        />
      </div>
    </div>
  );
};

export default EmployerDashboardPage;