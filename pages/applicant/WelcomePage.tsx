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
import {
  UserData,
  JobListing,
  Application,
  StatItem,
} from "../../components/types/types";

// Define WorkMode type for job work modes
type WorkMode = "Onsite" | "Remote" | "Hybrid";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock data for applications and stats (keep exactly as is)
  const applications: Application[] = [
    {
      id: 1,
      jobId: 1,
      status: "under review",
      date: "2023-06-15",
      updates: [
        { date: "2023-06-16", message: "Application received" },
        { date: "2023-06-18", message: "Under review by hiring team" },
      ],
    },
    {
      id: 2,
      jobId: 4,
      status: "interview",
      date: "2023-06-10",
      updates: [
        { date: "2023-06-12", message: "Application received" },
        { date: "2023-06-14", message: "Passed initial screening" },
        {
          date: "2023-06-16",
          message: "Technical interview scheduled for June 20",
        },
      ],
    },
  ];

  const stats: StatItem[] = [
    { name: "Applications Sent", value: 8, change: "+2", trend: "up" },
    { name: "Interview Rate", value: "25%", change: "+5%", trend: "up" },
    { name: "Profile Views", value: 24, change: "+8", trend: "up" },
    { name: "Saved Jobs", value: 5, change: "+1", trend: "up" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      console.log("Current token:", token);
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("Please login to access this page");
        }

        const response = await fetch(`/api/users/${userId}`, {
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
        localStorage.removeItem("userId");
        navigate("/");
      }
    };

    const fetchJobListings = async () => {
      setIsLoadingJobs(true);
      setJobError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("/api/getAllJobs", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch job listings");
        }

        const data = await response.json();
        console.log("Raw API data:", data);
        console.log(
          "API data:",
          data.data.map((job) => ({ id: job.id, work_mode: job.work_mode }))
        );
        // Transform the backend data to match the frontend JobListing type
        const transformedJobs = data.data.map((job: any) => ({
          id: job.id,
          title: job.job_title,
          company: job.company?.name || "Unknown Company", // Now using job.company.name
          logo_path: job.company.logo_path, // Now using job.company.logo
          location: job.job_location || "Remote",
          salary:
            job.salary_range_min && job.salary_range_max
              ? `${job.salary_range_min} - ${job.salary_range_max}`
              : "Negotiable",
          type: job.job_type || "Full-time",
          posted: formatPostedDate(job.posted_date),
          skills: [], // You'll need to adjust this based on your actual skills data
          status: "new",
          match: calculateMatchPercentage([]), // Adjust if you have skills data
          work_mode: ["Onsite", "Remote", "Hybrid"].includes(job.work_mode)
            ? job.work_mode
            : "Onsite",
        }));
        console.log("Transformed job listings:", transformedJobs);

        setJobListings(transformedJobs);
      } catch (error) {
        console.error("Error fetching job listings:", error);
        setJobError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoadingJobs(false);
      }
    };

    // Helper function to format the posted date (keep exactly as is)
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

    // Helper function to calculate match percentage (keep exactly as is)
    const calculateMatchPercentage = (skills: any[]) => {
      // In a real app, you'd compare with user's skills
      return Math.floor(Math.random() * 30) + 70; // Random between 70-100%
    };

    fetchUserData();
    fetchJobListings();
  }, [navigate]);

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 p-8">
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
      <div className="min-h-screen bg-gray-50">
        {/* Header (keep exactly as is) */}
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

        {/* Main Content (keep exactly as is) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs (keep exactly as is) */}
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

          {/* Tab Content (keep exactly as is) */}
          <div className="py-6">
            {activeTab === "dashboard" && (
              <ErrorBoundary>
                <DashboardTab
                  stats={stats}
                  jobListings={jobListings}
                  applications={applications}
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
                  />
                )}
              </ErrorBoundary>
            )}
            {activeTab === "applications" && (
              <ErrorBoundary>
                <ApplicationsTab
                  applications={applications}
                  jobListings={jobListings}
                />
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
    </ErrorBoundary>
  );
};

// TabButton component (keep exactly as is)
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
