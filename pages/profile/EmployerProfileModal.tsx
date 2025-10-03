import React, { useState, useEffect } from "react";
import UserAvatar from "../../components/UserAvatar";
import { getFullPhotoUrl } from "../../components/utils/photo";
import { useAuth } from "../../contexts/AuthContext";
import { FaUser, FaIdBadge, FaBuilding } from "react-icons/fa";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface EmployerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

const EmployerProfileModal: React.FC<EmployerProfileModalProps> = ({ isOpen, onClose, onEditProfile }) => {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [employerData, setEmployerData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || loading) return;
    if (!user) {
      onClose();
      return;
    }
    const fetchUserData = async () => {
      setFetchLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      try {
        if (!user?.id || !token) throw new Error("Not authenticated");
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUserData(data);
        // Fetch user photo URL just like the header
        const photoRes = await fetch(`/api/photos/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setUserPhotoUrl(photoData?.data?.photo_url || null);
        } else {
          setUserPhotoUrl(null);
        }
        const employerRes = await fetch(`/api/employer/${user.id}`);
        const employerData = await employerRes.json();
        if (employerData.success) setEmployerData(employerData.employer);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchUserData();
    // eslint-disable-next-line
  }, [user, loading, isOpen, onClose]);

  if (!isOpen) return null;
  if (loading || fetchLoading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-red-600">{error}</div>
      </div>
    );
  if (!userData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-white/80 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden relative max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center md:w-1/3 bg-gradient-to-b from-blue-200/60 to-indigo-100/60 p-8 relative">
          <div className="relative group shadow-lg rounded-full bg-white/80 p-2 ring-4 ring-blue-200">
            <UserAvatar
              photoUrl={getFullPhotoUrl(userPhotoUrl)}
              firstName={userData.first_name}
              lastName={userData.last_name}
              size="xl"
              className="border-2 border-blue-200"
            />
          </div>
          <div className="flex flex-col items-center mt-4 mb-2">
            <span className="text-xl font-semibold text-gray-600 tracking-tight">
              {userData.first_name}
            </span>
            <span className="text-xl font-semibold text-gray-600 tracking-tight">
              {userData.last_name}
            </span>
          </div>
          <span className="text-blue-700 font-semibold text-sm mb-2 capitalize">
            {userData.user_type}
          </span>
          <button
            className="mt-4 inline-flex items-center px-5 py-2.5 border border-blue-600 text-blue-700 font-semibold rounded-lg shadow-sm bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onClick={onEditProfile}
          >
            <FaUser className="mr-2" /> Edit Profile
          </button>
        </div>
        {/* Info Section */}
        <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
          {/* Account Details Card */}
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <FaIdBadge className="text-blue-600 text-2xl" />
              <span className="text-xl font-bold text-blue-700 tracking-wide">Account Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Username</label>
                <input
                  type="text"
                  value={userData.username || ""}
                  readOnly
                  className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={userData.email || ""}
                  readOnly
                  className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                />
              </div>
              <div className="md:col-span-2 flex gap-6">
                <div className="flex-1">
                  <label className="block text-gray-600 text-sm mb-1">First Name</label>
                  <input
                    type="text"
                    value={userData.first_name || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 text-sm mb-1">Last Name</label>
                  <input
                    type="text"
                    value={userData.last_name || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userData.phone_number || ""}
                  readOnly
                  className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">User Type</label>
                <input
                  type="text"
                  value={userData.user_type || ""}
                  readOnly
                  className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 capitalize"
                />
              </div>
            </div>
          </div>
          {/* Employer Details */}
          {employerData && (
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6">
                <FaBuilding className="text-blue-600 text-2xl" />
                <span className="text-xl font-bold text-blue-700 tracking-wide">Employer Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Company Name</label>
                  <input
                    type="text"
                    value={employerData.company_name || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Industry</label>
                  <input
                    type="text"
                    value={employerData.industry || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Company Size</label>
                  <input
                    type="text"
                    value={employerData.company_size || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Website URL</label>
                  <input
                    type="text"
                    value={employerData.website_url || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Founded Year</label>
                  <input
                    type="text"
                    value={employerData.founded_year || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={employerData.contact_person || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Address</label>
                  <input
                    type="text"
                    value={employerData.address || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Company Description</label>
                  <textarea
                    value={employerData.company_description || ""}
                    readOnly
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 min-h-[40px]"
                  />
                </div>
                {/* Logo Image */}
                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm mb-1">Company Logo</label>
                  {employerData.logo_path ? (
                    <img
                      src={`${API_BASE_URL}${employerData.logo_path}`}
                      alt="Company Logo"
                      className="h-24 w-auto rounded shadow border border-gray-200 bg-white p-2"
                      style={{ maxWidth: '200px', objectFit: 'contain' }}
                    />
                  ) : (
                    <span className="text-gray-400">No logo uploaded</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerProfileModal; 