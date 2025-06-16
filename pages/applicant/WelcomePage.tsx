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

const JobSeekerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  // Mock data
  const jobListings: JobListing[] = [
    {
      id: 1,
      title: "Senior Frontend Engineer",
      company: "TechInnovate",
      location: "Remote (US)",
      salary: "$150,000 - $180,000",
      type: "Full-time",
      posted: "2 days ago",
      skills: ["React", "TypeScript", "GraphQL"],
      status: "applied",
      match: 92,
    },
    {
      id: 2,
      title: "Frontend Tech Lead",
      company: "DigitalFuture",
      location: "San Francisco, CA",
      salary: "$160,000 - $200,000",
      type: "Full-time",
      posted: "1 week ago",
      skills: ["React", "Redux", "Node.js"],
      status: "saved",
      match: 87,
    },
    {
      id: 3,
      title: "Principal UI Developer",
      company: "WebCraft",
      location: "New York, NY",
      salary: "$170,000 - $210,000",
      type: "Full-time",
      posted: "3 days ago",
      skills: ["Angular", "RxJS", "NgRx"],
      status: "new",
      match: 78,
    },
  ];

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

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <DashboardTab
              stats={stats}
              jobListings={jobListings}
              applications={applications}
            />
          )}
          {activeTab === "jobs" && (
            <JobsTab
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              jobListings={jobListings}
            />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab
              applications={applications}
              jobListings={jobListings}
            />
          )}
          {activeTab === "saved" && <SavedJobsTab jobListings={jobListings} />}
          {activeTab === "profile" && <ProfileTab />}
        </div>
      </main>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement<{ className?: string }>; // Explicitly define icon props
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
      className: `${icon.props.className || ''} inline mr-2`.trim()
    })}
    {label}
  </button>
);

export default JobSeekerDashboard;
