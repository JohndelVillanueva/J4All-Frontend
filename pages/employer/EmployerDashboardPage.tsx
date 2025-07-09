import React, { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaUserTie,
  FaChartLine,
  FaEnvelope,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUserFriends,
} from "react-icons/fa";
import DynamicHeader from "../../components/JobSeekerDashboard/DynamicHeader";
import { useNavigate } from "react-router-dom";
import {
  UserData,
  JobListing,
  Application,
  StatItem,
  Applicant,
} from "../../components/types/types";
import CreatePositionModal from "../../components/EmployerDashboard/CreatePositionModal";
import EmployerMessageModal from "../../components/EmployerDashboard/EmployerMessageModal";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from '../../components/UserAvatar';

interface JobPosting {
  id: number;
  job_title: string;
  job_description: string;
  job_requirements: string;
  job_location: string;
  job_type: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  expiration_date: string | null;
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

const EmployerDashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [applicantsError, setApplicantsError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Guard: Show loading spinner while auth is loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Guard: If not authenticated, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user) {
      if (user.user_type === "pwd" || user.user_type === "indigenous" || user.user_type === "general") {
        navigate("/ApplicantDashboard");
      } else if (user.user_type === "admin") {
        navigate("/AdminDashboard");
      }
    }
    // eslint-disable-next-line
  }, [user, loading, navigate]);

  // If not authenticated, don't render dashboard
  if (!user) return null;

  // Fetch applicants from backend
  const fetchApplicants = async () => {
    setIsLoadingApplicants(true);
    setApplicantsError(null);
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
      setApplicantsError(err instanceof Error ? err.message : 'An unknown error occurred');
      setApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const openPositions = jobPostings.filter(job => job.status === "active");

  const metrics = [
    { title: "Open Positions", value: openPositions.length, change: "+1", trend: "up" },
    { title: "Total Applicants", value: applicants.length, change: "+12", trend: "up" },
    { title: "Interview Rate", value: "32%", change: "+5%", trend: "up" },
    { title: "Hire Rate", value: "18%", change: "-2%", trend: "down" },
  ];

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
    setJobError(null);
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
      setJobError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    setJobError(error instanceof Error ? error.message : 'An unknown error occurred');
    throw error;
  }
};
console.log('EmployerDashboard mounted');

  // Debug: Show modal state
  console.log("Render: isMessageModalOpen", isMessageModalOpen, "selectedApplicant", selectedApplicant);

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader
        title="DevCareer Dashboard"
        user={{
          firstName: currentUser?.first_name || "",
          lastName: currentUser?.last_name || "",
        }}
        showSearch={true}
        onSearchChange={setSearchTerm}
        className="bg-white shadow-sm"
      />

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
            <button
              onClick={() => setActiveTab("messages")}
              className={`${
                activeTab === "messages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaEnvelope className="inline mr-2" />
              Messages
            </button>
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
                          <dd className="flex items-baseline">
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
                          </dd>
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

          {activeTab === "positions" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Job Positions
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Position
                </button>
              </div>

              {isLoadingJobs ? (
                <div className="flex justify-center items-center py-10">
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Loading job postings...
                </div>
              ) : jobError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">
                  {jobError}
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
                              <button className="mr-3 text-blue-600 hover:text-blue-800">
                                View Applicants
                              </button>
                              <button className="text-gray-600 hover:text-gray-800">
                                Edit
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
                    <select className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>All Statuses</option>
                      <option>Under Review</option>
                      <option>Interview</option>
                      <option>Hired</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBriefcase className="text-gray-400" />
                    </div>
                    <select className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>All Positions</option>
                      <option>Senior Frontend Developer</option>
                      <option>Frontend Tech Lead</option>
                      <option>React Specialist</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoadingApplicants ? (
                <div className="flex justify-center items-center py-10">
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Loading applicants...
                </div>
              ) : applicantsError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">
                  {applicantsError}
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
                    {filteredApplicants.map((applicant) => (
                      <li key={applicant.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                <UserAvatar
                                  photoUrl={applicant.photo ? `http://localhost:3111${applicant.photo}` : undefined}
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
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Schedule Interview
                              </button>
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

          {activeTab === "messages" && (
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
          )}
        </div>
      </main>
      <CreatePositionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJobPosting}
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
    </div>
  );
};

export default EmployerDashboardPage;