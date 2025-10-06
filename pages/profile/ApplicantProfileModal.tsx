import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaBriefcase, FaGraduationCap, FaMapMarkerAlt, FaStar, FaEye, FaEyeSlash } from "react-icons/fa";
import UserAvatar from "../../components/UserAvatar";
import { useToast } from "../../components/ToastContainer";
import { handleApiError } from "../../src/utils/errorHandler";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApplicantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantUserId: number;
}

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  photo: string | null;
  user_type: string;
  created_at: string;
  last_login: string | null;
}

interface JobSeekerData {
  id: number;
  resume_text: string | null;
  resume_file_path: string | null;
  education: string | null;
  experience_years: number | null;
  current_job_title: string | null;
  desired_job_title: string | null;
  desired_salary: number | null;
  location_preference: string | null;
  disability: string | null;
  skills: Array<{
    id: number;
    name: string;
    category: string | null;
    proficiency_level: number | null;
    years_of_experience: number | null;
  }>;
}

interface ProfileData {
  user: UserData;
  jobSeeker: JobSeekerData;
}

const ApplicantProfileModal: React.FC<ApplicantProfileModalProps> = ({
  isOpen,
  onClose,
  applicantUserId
}) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResume, setShowResume] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && applicantUserId) {
      fetchApplicantProfile();
    }
  }, [isOpen, applicantUserId]);

  const fetchApplicantProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/applicant-profile?applicantUserId=${applicantUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applicant profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch applicant profile');
      }
    } catch (err) {
      console.error('Error fetching applicant profile:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      showToast(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFullPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null;
    return photoPath.startsWith('http') ? photoPath : `${API_BASE_URL}${photoPath}`;
  };

  // const getSkillLevelText = (level: number | null) => {
  //   if (!level) return 'Not specified';
  //   const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
  //   return levels[Math.min(level - 1, levels.length - 1)];
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-md pt-16">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Applicant Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <FaTimes size={48} className="mx-auto mb-4" />
                <p className="text-lg font-semibold">Error Loading Profile</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <button
                onClick={fetchApplicantProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : profileData ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex-shrink-0">
                  <UserAvatar
                    photoUrl={getFullPhotoUrl(profileData.user.photo)}
                    firstName={profileData.user.first_name}
                    lastName={profileData.user.last_name}
                    size="lg"
                    className="h-20 w-20"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {profileData.user.first_name} {profileData.user.last_name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-blue-600" />
                      <span>{profileData.user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-blue-600" />
                      <span>{profileData.user.phone_number || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBriefcase className="mr-2 text-blue-600" />
                      <span>{profileData.jobSeeker.current_job_title || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-600" />
                      <span>{profileData.jobSeeker.location_preference || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  {/* Personal Details */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUser className="mr-2 text-blue-600" />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User Type:</span>
                        <span className="font-medium capitalize">{profileData.user.user_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{formatDate(profileData.user.created_at)}</span>
                      </div>
                      {profileData.user.last_login && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Login:</span>
                          <span className="font-medium">{formatDate(profileData.user.last_login)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disability:</span>
                        <span className="font-medium">{profileData.jobSeeker.disability || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Education & Experience */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaGraduationCap className="mr-2 text-blue-600" />
                      Education & Experience
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 block mb-1">Education:</span>
                        <span className="font-medium">
                          {profileData.jobSeeker.education || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Experience:</span>
                        <span className="font-medium">
                          {profileData.jobSeeker.experience_years 
                            ? `${profileData.jobSeeker.experience_years} years`
                            : 'Not specified'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Current Position:</span>
                        <span className="font-medium">
                          {profileData.jobSeeker.current_job_title || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Desired Position:</span>
                        <span className="font-medium">
                          {profileData.jobSeeker.desired_job_title || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Desired Salary:</span>
                        <span className="font-medium">
                          {profileData.jobSeeker.desired_salary 
                            ? `$${profileData.jobSeeker.desired_salary.toLocaleString()}`
                            : 'Not specified'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Skills & Resume */}
                <div className="space-y-6">
                  {/* Skills */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaStar className="mr-2 text-blue-600" />
                      Skills ({profileData.jobSeeker.skills.length})
                    </h4>
                    {profileData.jobSeeker.skills.length > 0 ? (
                      <div className="space-y-3">
                        {profileData.jobSeeker.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No skills listed</p>
                    )}
                  </div>

                  {/* Resume */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaBriefcase className="mr-2 text-blue-600" />
                      Resume
                    </h4>
                    {profileData.jobSeeker.resume_text ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">Resume Text</span>
                          <button
                            onClick={() => setShowResume(!showResume)}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          >
                            {showResume ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
                            {showResume ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {showResume && (
                          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {profileData.jobSeeker.resume_text}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No resume text available</p>
                    )}
                    
                    {profileData.jobSeeker.resume_file_path && (
                      <div className="mt-4">
                        <span className="text-sm text-gray-600 block mb-2">Resume File:</span>
                        <a
                          href={`${API_BASE_URL}${profileData.jobSeeker.resume_file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaEye className="mr-2" />
                          View Resume File
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfileModal;