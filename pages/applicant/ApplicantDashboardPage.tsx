import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaUser,
  FaBookmark,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";
import DynamicHeader from "../../components/JobSeekerDashboard/DynamicHeader";
import DashboardTab from "../../components/JobSeekerDashboard//DashboardTab";
import JobsTab from "../../components/JobSeekerDashboard//JobsTab";
import ApplicationsTab from "../../components/JobSeekerDashboard/ApplicationTab";
import SavedJobsTab from "../../components/JobSeekerDashboard/SaveJobsTab";
import ProfileTab from "../../components/JobSeekerDashboard/ProfileTab";
import PWDVerificationBanner from "../../components/JobSeekerDashboard/PWDVerificationBanner";
import PWDVerifiedBadge from "../../components/JobSeekerDashboard/PWDVerifiedBadge";
import EditJobSeekerAccountModal from "../profile/EditJobSeekerAccountModal";
import {
  UserData,
  JobListing,
  Application,
  StatItem,
} from "../../components/types/types";
import { useAuth } from "../../contexts/AuthContext";

// ErrorBoundary component definition (keep exactly as is)
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  },
  {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
  }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <h3 className="text-sm font-medium text-red-800">
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {this.state.error?.toString()}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

const JobSeekerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [, setIsLoadingUser] = useState(true);
  const [, setUserError] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  
  // PWD Verification states
  const [showPWDVerification, setShowPWDVerification] = useState(false);
  const [showPWDVerifiedBadge, setShowPWDVerifiedBadge] = useState(false);
  const [pwdVerificationDismissed, setPWDVerificationDismissed] = useState(false);
  const [seekerData, setSeekerData] = useState<any>(null);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const [showEditJobSeekerModal, setShowEditJobSeekerModal] = useState(false);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData: UserData | null, seekerData: any) => {
    if (!userData) return 0;

    const fields = [
      // User table fields
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.phone_number,
      userData.photo,
      // Job seeker fields (excluding pwd_number and resume fields)
      seekerData?.disability,
      seekerData?.education,
      seekerData?.experience_years,
      seekerData?.current_job_title,
      seekerData?.desired_job_title,
      seekerData?.location_preference,
      // Check if they have at least one skill
      seekerData?.skills && seekerData.skills.length > 0 ? 'has_skills' : null,
    ];

    const filledFields = fields.filter(field => 
      field !== null && 
      field !== undefined && 
      field !== ''
    ).length;

    const percentage = Math.round((filledFields / fields.length) * 100);
    return percentage;
  };

  // Update profile completion when user or seeker data changes
  useEffect(() => {
    if (currentUser || seekerData) {
      const completion = calculateProfileCompletion(currentUser, seekerData);
      setProfileCompletionPercentage(completion);
      console.log('Profile completion:', completion + '%');
    }
  }, [currentUser, seekerData]);

  if (loading) return <div>Loading...</div>;

  // Only allow job seekers
  if (user && user.user_type === "employer") {
    navigate("/EmployerDashboard");
    return null;
  }
  if (user && user.user_type === "admin") {
    navigate("/AdminDashboard");
    return null;
  }

  // Only fetch data for job seekers
  useEffect(() => {
    if (user && (user.user_type === "pwd" || user.user_type === "indigenous" || user.user_type === "general")) {
      fetchUserData();
      fetchApplications();
      fetchSavedJobs();
      
      // Fetch seeker data for PWD verification check
      if (user.user_type === "pwd") {
        fetchSeekerData();
      }
    }
  }, [user]);

  // Check if PWD verification is needed - FIXED VERSION
 useEffect(() => {
    if (user?.user_type === "pwd" && seekerData && !pwdVerificationDismissed) {
      // Check both users table and job_seekers table
      const hasPwdNumber = user.pwd_id_number && user.pwd_id_number.trim() !== '';
      const hasDisability = seekerData.disability && seekerData.disability.trim() !== '';
      
      const needsVerification = !hasPwdNumber || !hasDisability;
      const isFullyVerified = hasPwdNumber && hasDisability && profileCompletionPercentage === 100;
      
      console.log('PWD Verification Check:', {
        userType: user.user_type,
        pwdNumber: user.pwd_id_number,
        disability: seekerData.disability,
        completion: profileCompletionPercentage,
        needsVerification,
        isFullyVerified,
        dismissed: pwdVerificationDismissed
      });
      
      // ✅ UPDATED: Don't show badge when fully verified (user already knows they're verified)
      if (isFullyVerified) {
        setShowPWDVerifiedBadge(false);
        setShowPWDVerification(false);
      } else if (needsVerification && profileCompletionPercentage < 100) {
        // Show verification banner ONLY if PWD fields missing AND profile not 100%
        setShowPWDVerification(true);
        setShowPWDVerifiedBadge(false);
      } else {
        // Profile 100% OR PWD fields filled - don't show either
        setShowPWDVerification(false);
        setShowPWDVerifiedBadge(false);
      }
    } else {
      // User is not PWD or data not loaded - hide both
      setShowPWDVerification(false);
      setShowPWDVerifiedBadge(false);
    }
  }, [user, seekerData, pwdVerificationDismissed, profileCompletionPercentage]);

  // Fetch job listings after applications are loaded
  useEffect(() => {
    if (user && (user.user_type === "pwd" || user.user_type === "indigenous" || user.user_type === "general")) {
      fetchJobListings();
    }
  }, [applications]);

  // Hide header after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHeader(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch seeker data for PWD verification
  const fetchSeekerData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      
      // Use your existing endpoint: /api/jobseeker/:userId
      const response = await fetch(`/api/jobseeker/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If seeker record doesn't exist, assume empty data (will trigger verification)
        console.log("Seeker data not found, assuming incomplete profile");
        setSeekerData({ pwd_number: null, disability: null });
        return;
      }
      
      const data = await response.json();
      console.log("Fetched seeker data:", data.jobSeeker);
      setSeekerData(data.jobSeeker); // Note: your API returns 'jobSeeker' not 'data'
    } catch (error) {
      console.error("Seeker data fetch error:", error);
      // Set empty data to trigger verification banner
      setSeekerData({ pwd_number: null, disability: null });
    }
  };

  // Fetch saved jobs from backend
  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch("/api/saved-jobs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch saved jobs");
      }
      
      const data = await response.json();
      console.log('Fetched saved jobs:', data);
      setSavedJobsCount(data.data?.length || 0);
    } catch (error) {
      console.error("Saved jobs fetch error:", error);
      setSavedJobsCount(0);
    }
  };

  // Fetch applications from backend
  const fetchApplications = async () => {
    setIsLoadingApplications(true);
    setApplicationsError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch("/api/applications", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }
      
      const data = await response.json();
      console.log('Fetched applications:', data);
      
      if (data.success && data.data) {
        setApplications(data.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setApplicationsError(error instanceof Error ? error.message : "Failed to fetch applications");
      console.error("Applications fetch error:", error);
      setApplications([]);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Mock data for stats
  const stats: StatItem[] = [
    { name: "Applications Sent", value: applications.length, change: "", trend: "up" },
    { name: "Saved Jobs", value: savedJobsCount, change: "", trend: "up" },
  ];

  // Enhanced fetch functions with better error handling
  const fetchUserData = async () => {
    setIsLoadingUser(true);
    setUserError(null);
    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      if (!userId) throw new Error("Authentication required");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }
      const data = await response.json();
      setCurrentUser(data);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to fetch user data");
      console.error("User data fetch error:", err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Enhanced job fetch with loading states and error handling
  const fetchJobListings = async () => {
    setIsLoadingJobs(true);
    setJobError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      const response = await fetch("/api/getAllJobs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch jobs");
      }
      const data = await response.json();
      
      // Get user's applications to check which jobs they've applied for
      const userApplications = applications.map(app => app.jobId);
      
      const transformedJobs = data.data.map((job: any) => ({
        id: job.id,
        title: job.job_title,
        company: job.company?.name || "Unknown Company",
        logo_path: job.company?.logo || "/default-logo.png",
        location: job.job_location || "Remote",
        job_description: job.job_description || "No description available.",
        job_requirements: job.job_requirements || "No requirements specified.",
        salary: job.salary_range 
          ? `${job.salary_range.min} - ${job.salary_range.max}`
          : "Negotiable",
        type: job.job_type || "Full-time",
        posted: formatPostedDate(job.posted_date),
        skills: job.required_skills?.map((skill: any) => ({
          id: skill.skill.id,
          name: skill.skill.name,
          category: skill.skill.category,
          is_required: skill.is_required,
          importance_level: skill.importance_level
        })) || [],
        status: userApplications.includes(job.id) ? "applied" : "new",
        work_mode: ["Onsite", "Remote", "Hybrid"].includes(job.work_mode)
          ? job.work_mode
          : "Onsite",
        employer_id: job.employer_id,
        employer_user_id: job.employer_user_id,
        hrFirstName: job.hrFirstName || '',
        hrLastName: job.hrLastName || '',
        applicants: job.applicants || 0,
      }));

      setJobListings(transformedJobs);
    } catch (error) {
      setJobError(error instanceof Error ? error.message : "Failed to fetch jobs");
      console.error("Job fetch error:", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Helper function to format the posted date
  const formatPostedDate = (dateString: string) => {
    const postedDate = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < 1) return "Today";
    if (diffInDays < 2) return "Yesterday";
    if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Function to handle job status updates
  const handleJobStatusUpdate = (jobId: string, newStatus: "new" | "applied" | "saved") => {
    setJobListings(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  };

  // Handle PWD verification click
  const handleVerifyClick = () => {
    setShowEditJobSeekerModal(true);
    setShowPWDVerification(false);
  };

  // Handle PWD verification dismiss
  const handleDismissVerification = () => {
    setPWDVerificationDismissed(true);
    setShowPWDVerification(false);
  };

  // Handle modal close and refresh seeker data
  const handleEditJobSeekerModalClose = () => {
    setShowEditJobSeekerModal(false);
    // Refresh seeker data after modal closes
    if (user?.user_type === "pwd") {
      fetchSeekerData();
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-red-50 border-l-4 border-red-400">
          <h1 className="text-2xl font-bold text-red-600">Critical Error</h1>
          <p className="mt-4 text-gray-700">
            We're sorry, but something went wrong with the dashboard. Please try
            refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      <div className="min-h-screen relative overflow-hidden flex flex-col">
        {/* Floating PWD Verification Banner - Shows when profile incomplete */}
        <PWDVerificationBanner
          isVisible={showPWDVerification}
          onVerifyClick={handleVerifyClick}
          onDismiss={handleDismissVerification}
          completionPercentage={profileCompletionPercentage}
        />

        {/* PWD Verified Badge - Shows when profile is 100% complete */}
        <PWDVerifiedBadge
          isVisible={showPWDVerifiedBadge}
          completionPercentage={profileCompletionPercentage}
        />

        {/* Edit Job Seeker Modal */}
        {showEditJobSeekerModal && (
          <EditJobSeekerAccountModal
            isOpen={showEditJobSeekerModal}
            onClose={handleEditJobSeekerModalClose}
            userId={user?.id || 0}
          />
        )}

        {/* Rich background gradient and floating shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 opacity-30 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 opacity-30 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-200 opacity-20 rounded-full filter blur-2xl animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
        </div>
        
        {/* Main dashboard content */}
        <div className="relative z-10">
          {/* Header */}
          {showHeader && (
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
          )}

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <TabButton
                  active={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  icon={<FaChartLine />}
                  label="Dashboard"
                />
                <TabButton
                  active={activeTab === "jobs"}
                  onClick={() => setActiveTab("jobs")}
                  icon={<FaBriefcase />}
                  label="Job Search"
                />
                <TabButton
                  active={activeTab === "applications"}
                  onClick={() => setActiveTab("applications")}
                  icon={<FaCheckCircle />}
                  label="Applications"
                />
                <TabButton
                  active={activeTab === "saved"}
                  onClick={() => setActiveTab("saved")}
                  icon={<FaBookmark />}
                  label="Saved Jobs"
                />
                <TabButton
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                  icon={<FaUser />}
                  label="Profile"
                />
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "dashboard" && (
                <ErrorBoundary>
                  <DashboardTab
                    stats={stats}
                    jobListings={jobListings}
                    applications={applications}
                    onJobStatusUpdate={handleJobStatusUpdate}
                  />
                </ErrorBoundary>
              )}
              {activeTab === "jobs" && (
                <ErrorBoundary>
                  {isLoadingJobs ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : jobError ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{jobError}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <JobsTab
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      jobListings={jobListings}
                      onJobStatusUpdate={handleJobStatusUpdate}
                    />
                  )}
                </ErrorBoundary>
              )}
              {activeTab === "applications" && (
                <ErrorBoundary>
                  {isLoadingApplications ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : applicationsError ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{applicationsError}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ApplicationsTab
                      applications={applications}
                      jobListings={jobListings}
                    />
                  )}
                </ErrorBoundary>
              )}
              {activeTab === "saved" && (
                <ErrorBoundary>
                  <SavedJobsTab jobListings={jobListings} />
                </ErrorBoundary>
              )}
              {activeTab === "profile" && (
                <ErrorBoundary>
                  <ProfileTab />
                </ErrorBoundary>
              )}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// TabButton component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement<{ className?: string }>;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      whitespace-nowrap 
      py-4 
      px-1 
      border-b-2 
      font-medium 
      text-sm
      ${
        active
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }
    `}
  >
    {React.cloneElement(icon, {
      className: `${icon.props.className || ""} inline mr-2`.trim(),
    })}
    {label}
  </button>
);

export default JobSeekerDashboard;