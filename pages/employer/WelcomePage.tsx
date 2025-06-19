import React, { useEffect, useState } from 'react';
import { FaBriefcase, FaUserTie, FaChartLine, FaEnvelope, FaSearch, FaFilter, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import DynamicHeader from "../../components/JobSeekerDashboard/DynamicHeader";
import { useNavigate } from "react-router-dom";
import {
  UserData,
  JobListing,
  Application,
  StatItem,
} from "../../components/types/types";
import CreatePositionModal from '../../components/EmployerDashboard/CreatePositionModal';

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data
  const jobOpenings = [
    { id: 1, title: 'Senior Frontend Developer', applicants: 24, status: 'active', posted: '2023-05-15' },
    { id: 2, title: 'Frontend Tech Lead', applicants: 12, status: 'active', posted: '2023-06-01' },
    { id: 3, title: 'React Specialist', applicants: 8, status: 'closed', posted: '2023-04-10' },
  ];

  const applicants = [
    { id: 1, name: 'Alex Johnson', position: 'Senior Frontend Developer', status: 'review', experience: '7 years', skills: ['React', 'TypeScript', 'Redux'], applied: '2023-06-10' },
    { id: 2, name: 'Sarah Chen', position: 'Senior Frontend Developer', status: 'interview', experience: '5 years', skills: ['Angular', 'RxJS', 'NgRx'], applied: '2023-06-05' },
    { id: 3, name: 'Michael Brown', position: 'Frontend Tech Lead', status: 'rejected', experience: '9 years', skills: ['React', 'GraphQL', 'Next.js'], applied: '2023-05-28' },
    { id: 4, name: 'Emma Wilson', position: 'Senior Frontend Developer', status: 'hired', experience: '6 years', skills: ['Vue', 'Nuxt', 'Vuex'], applied: '2023-05-20' },
  ];

  const metrics = [
    { title: 'Open Positions', value: 2, change: '+1', trend: 'up' },
    { title: 'Total Applicants', value: 44, change: '+12', trend: 'up' },
    { title: 'Interview Rate', value: '32%', change: '+5%', trend: 'up' },
    { title: 'Hire Rate', value: '18%', change: '-2%', trend: 'down' },
  ];

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaChartLine className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`${activeTab === 'positions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaBriefcase className="inline mr-2" />
              Job Positions
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`${activeTab === 'applicants' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaUserTie className="inline mr-2" />
              Applicants
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`${activeTab === 'messages' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaEnvelope className="inline mr-2" />
              Messages
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recruitment Overview</h2>
              
              {/* Metrics */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {metrics.map((metric, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
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
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.change}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
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
                              {applicant.status === 'hired' && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Hired
                                </span>
                              )}
                              {applicant.status === 'interview' && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Interview
                                </span>
                              )}
                              {applicant.status === 'review' && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Under Review
                                </span>
                              )}
                              {applicant.status === 'rejected' && (
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
                                <span key={i} className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
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

          {activeTab === 'positions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Job Positions</h2>
                <button 
  onClick={() => setIsModalOpen(true)}
  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>
  Create New Position
</button>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {jobOpenings.map((job) => (
                    <li key={job.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-blue-600 truncate">
                            {job.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            {job.status === 'active' ? (
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
                              <FaUserTie className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {job.applicants} applicants
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Posted on {job.posted}
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
            </div>
          )}

          {activeTab === 'applicants' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Applicants</h2>
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
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 text-lg font-medium">
                                {applicant.name.charAt(0)}
                              </span>
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
                            {applicant.status === 'hired' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Hired
                              </span>
                            )}
                            {applicant.status === 'interview' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Interview
                              </span>
                            )}
                            {applicant.status === 'review' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Under Review
                              </span>
                            )}
                            {applicant.status === 'rejected' && (
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
                              <span key={i} className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-3">
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View Profile
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Message
                          </button>
                          {applicant.status === 'review' && (
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
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Messages</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Candidate Communications
                  </h3>
                </div>
                <div className="bg-white p-6 text-center">
                  <FaEnvelope className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
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
  onSubmit={async (position) => {
    console.log('New position:', position);
    // Here you would typically send the data to your backend
    // and update your jobOpenings state
  }}
/>
    </div>
  );
};

export default EmployerDashboard;