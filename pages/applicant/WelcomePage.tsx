import React, { useState } from 'react';
import { FaSearch, FaBriefcase, FaUser, FaBookmark, FaChartLine, FaCheckCircle, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';

const JobSeekerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  

  // Mock data
  const jobListings = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'TechInnovate',
      location: 'Remote (US)',
      salary: '$150,000 - $180,000',
      type: 'Full-time',
      posted: '2 days ago',
      skills: ['React', 'TypeScript', 'GraphQL'],
      status: 'applied',
      match: 92
    },
    {
      id: 2,
      title: 'Frontend Tech Lead',
      company: 'DigitalFuture',
      location: 'San Francisco, CA',
      salary: '$160,000 - $200,000',
      type: 'Full-time',
      posted: '1 week ago',
      skills: ['React', 'Redux', 'Node.js'],
      status: 'saved',
      match: 87
    },
    {
      id: 3,
      title: 'Principal UI Developer',
      company: 'WebCraft',
      location: 'New York, NY',
      salary: '$170,000 - $210,000',
      type: 'Full-time',
      posted: '3 days ago',
      skills: ['Angular', 'RxJS', 'NgRx'],
      status: 'new',
      match: 78
    },
  ];

  const applications = [
    {
      id: 1,
      jobId: 1,
      status: 'under review',
      date: '2023-06-15',
      updates: [
        { date: '2023-06-16', message: 'Application received' },
        { date: '2023-06-18', message: 'Under review by hiring team' }
      ]
    },
    {
      id: 2,
      jobId: 4,
      status: 'interview',
      date: '2023-06-10',
      updates: [
        { date: '2023-06-12', message: 'Application received' },
        { date: '2023-06-14', message: 'Passed initial screening' },
        { date: '2023-06-16', message: 'Technical interview scheduled for June 20' }
      ]
    }
  ];

  const filteredJobs = jobListings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    { name: 'Applications Sent', value: 8, change: '+2', trend: 'up' },
    { name: 'Interview Rate', value: '25%', change: '+5%', trend: 'up' },
    { name: 'Profile Views', value: 24, change: '+8', trend: 'up' },
    { name: 'Saved Jobs', value: 5, change: '+1', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DevCareer Dashboard</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaChartLine className="inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`${activeTab === 'jobs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaBriefcase className="inline mr-2" />
              Job Search
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`${activeTab === 'applications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaCheckCircle className="inline mr-2" />
              Applications
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`${activeTab === 'saved' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaBookmark className="inline mr-2" />
              Saved Jobs
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaUser className="inline mr-2" />
              Profile
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Job Search Overview</h2>
              
              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
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
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.change}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Jobs */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recommended Jobs For You
                  </h3>
                </div>
                <div className="bg-white overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {jobListings.slice(0, 3).map((job) => (
                      <li key={job.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 text-lg font-medium">
                                  {job.company.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <p className="text-lg font-medium text-blue-600">
                                  {job.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {job.company} • {job.location}
                                </p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                                {job.match}% Match
                              </span>
                              <span className="text-sm text-gray-500">
                                {job.posted}
                              </span>
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
                              {job.skills.map((skill, i) => (
                                <span key={i} className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-3">
                            {job.status === 'new' ? (
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Apply Now
                              </button>
                            ) : job.status === 'applied' ? (
                              <span className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100">
                                Applied
                              </span>
                            ) : (
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Save Job
                              </button>
                            )}
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              View Details
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="bg-white overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {applications.map((app) => {
                      const job = jobListings.find(j => j.id === app.jobId) || jobListings[0];
                      return (
                        <li key={app.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-blue-600">
                                  {job.title} at {job.company}
                                </p>
                                <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                                  Applied on {app.date}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                {app.status === 'under review' && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Under Review
                                  </span>
                                )}
                                {app.status === 'interview' && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Interview Stage
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="relative pt-1 w-full">
                                  <div className="flex mb-2 items-center justify-between">
                                    <div>
                                      <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${app.status === 'interview' ? 'text-yellow-600 bg-yellow-200' : 'text-blue-600 bg-blue-200'}`}>
                                        {app.status}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-semibold inline-block">
                                        {app.status === 'interview' ? '75%' : '40%'} complete
                                      </span>
                                    </div>
                                  </div>
                                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                    <div
                                      style={{ width: `${app.status === 'interview' ? '75%' : '40%'}` }}
                                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${app.status === 'interview' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Updates:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {app.updates.map((update, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-blue-500 mr-2">•</span>
                                      <span>{update.date}: {update.message}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
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
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <li key={job.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 text-lg font-medium">
                                {job.company.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="text-lg font-medium text-blue-600">
                                {job.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {job.company} • {job.location}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                              {job.match}% Match
                            </span>
                            <span className="text-sm text-gray-500">
                              {job.posted}
                            </span>
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
                            {job.skills.map((skill, i) => (
                              <span key={i} className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-3">
                          {job.status === 'new' ? (
                            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Apply Now
                            </button>
                          ) : job.status === 'applied' ? (
                            <span className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100">
                              Applied
                            </span>
                          ) : (
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Save Job
                            </button>
                          )}
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View Details
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Applications</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Track Your Application Progress
                  </h3>
                </div>
                <div className="bg-white overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {applications.map((app) => {
                      const job = jobListings.find(j => j.id === app.jobId) || jobListings[0];
                      return (
                        <li key={app.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 text-lg font-medium">
                                    {job.company.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <p className="text-lg font-medium text-blue-600">
                                    {job.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {job.company} • Applied on {app.date}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                {app.status === 'under review' && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Under Review
                                  </span>
                                )}
                                {app.status === 'interview' && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Interview Stage
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="relative pt-1 w-full">
                                  <div className="flex mb-2 items-center justify-between">
                                    <div>
                                      <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${app.status === 'interview' ? 'text-yellow-600 bg-yellow-200' : 'text-blue-600 bg-blue-200'}`}>
                                        {app.status}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-semibold inline-block">
                                        {app.status === 'interview' ? '75%' : '40%'} complete
                                      </span>
                                    </div>
                                  </div>
                                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                    <div
                                      style={{ width: `${app.status === 'interview' ? '75%' : '40%'}` }}
                                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${app.status === 'interview' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Recent Updates:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {app.updates.slice(0, 3).map((update, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-blue-500 mr-2">•</span>
                                      <span>{update.date}: {update.message}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <FaEnvelope className="mr-2" />
                                Message Recruiter
                              </button>
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                View Job Posting
                                <FaExternalLinkAlt className="ml-2" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Jobs</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Jobs You've Saved for Later
                  </h3>
                </div>
                <div className="bg-white overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {jobListings.filter(job => job.status === 'saved').map((job) => (
                      <li key={job.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 text-lg font-medium">
                                  {job.company.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <p className="text-lg font-medium text-blue-600">
                                  {job.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {job.company} • {job.location}
                                </p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                                {job.match}% Match
                              </span>
                              <span className="text-sm text-gray-500">
                                {job.posted}
                              </span>
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
                              {job.skills.map((skill, i) => (
                                <span key={i} className="mr-2 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-3">
                            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Apply Now
                            </button>
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Profile</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Senior Frontend Developer Profile
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-gray-600">
                      Experienced Senior Frontend Developer with 7+ years building responsive, accessible web applications. 
                      Specialized in React, TypeScript, and modern JavaScript frameworks. Passionate about creating 
                      intuitive user experiences and mentoring junior developers.
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Redux', 'GraphQL', 'Next.js', 'Jest', 'Cypress', 'Node.js', 'Webpack', 'Sass'].map((skill, i) => (
                        <span key={i} className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Experience</h4>
                      <ul className="space-y-4">
                        <li>
                          <h5 className="font-medium">Lead Frontend Developer</h5>
                          <p className="text-sm text-gray-600">TechCorp • 2019 - Present</p>
                        </li>
                        <li>
                          <h5 className="font-medium">Senior UI Developer</h5>
                          <p className="text-sm text-gray-600">WebSolutions • 2016 - 2019</p>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Education</h4>
                      <ul className="space-y-4">
                        <li>
                          <h5 className="font-medium">MSc Computer Science</h5>
                          <p className="text-sm text-gray-600">State University • 2015</p>
                        </li>
                        <li>
                          <h5 className="font-medium">BSc Software Engineering</h5>
                          <p className="text-sm text-gray-600">State University • 2013</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobSeekerDashboard;