import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdBadge, FaEnvelope, FaPhone, FaUserGraduate, FaBriefcase, FaMoneyBill, FaMapMarkerAlt, FaSave, FaCamera } from 'react-icons/fa';
import { useToast } from '../../components/ToastContainer';
import UserAvatar from '../../components/UserAvatar';
import { getFullPhotoUrl } from '../../components/utils/photo';
import clsx from 'clsx';

const EditAccount: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [jobSeekerData, setJobSeekerData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchUserData = async () => {
      setFetchLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        if (!user?.id || !token) throw new Error('Not authenticated');
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUserData(data);
        // Fetch user photo URL just like the header
        const photoRes = await fetch(`/api/photos/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setUserPhotoUrl(photoData?.data?.photo_url || null);
        } else {
          setUserPhotoUrl(null);
        }
        if (["pwd", "indigenous", "general"].includes(user.user_type)) {
          const seekerRes = await fetch(`/api/jobseeker-by-user/${user.id}`);
          const seekerData = await seekerRes.json();
          if (seekerData.success) setJobSeekerData(seekerData.jobSeeker);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchUserData();
  }, [user, loading, navigate]);

  // Handle input changes
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
  const handleJobSeekerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobSeekerData({ ...jobSeekerData, [e.target.name]: e.target.value });
  };

  // Avatar upload handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast({ type: 'error', message: 'Please select an image file.' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const token = localStorage.getItem('token');
    let photoUrl = userData.photo;
    try {
      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('photo', avatarFile);
        const uploadRes = await fetch('/api/photos/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Failed to upload photo');
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.photoUrl || uploadData.url || uploadData.path;
      }
      // Update user info
      const userRes = await fetch(`/api/users/${user!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...userData, photo: photoUrl })
      });
      if (!userRes.ok) throw new Error('Failed to update user info');
      // Update job seeker info if applicable
      if (jobSeekerData) {
        const seekerRes = await fetch(`/api/jobseeker-by-user/${user!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(jobSeekerData)
        });
        if (!seekerRes.ok) throw new Error('Failed to update job seeker info');
      }
      showToast({ type: 'success', message: 'Profile updated successfully!', autoHide: true, autoHideDelay: 3000 });
      setAvatarFile(null);
    } catch (err: any) {
      setError(err.message || 'Error saving data');
      showToast({ type: 'error', message: err.message || 'Error saving data', autoHide: true, autoHideDelay: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetchLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!userData) return <div className="p-8 text-center">No user data found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 py-8 px-2">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-0 relative border border-blue-100 hover:shadow-3xl transition-shadow duration-300">
        {/* Avatar Section */}
        <div className="flex flex-col items-center -mt-16 mb-4 relative z-10">
          <div className="relative group shadow-lg rounded-full bg-white/80 p-2 ring-4 ring-blue-200">
            <UserAvatar
              photoUrl={avatarFile ? avatarPreview : getFullPhotoUrl(userPhotoUrl)}
              firstName={userData.first_name}
              lastName={userData.last_name}
              size="xl"
              className="cursor-pointer border-2 border-blue-200 group-hover:border-blue-500 transition-all"
              onClick={handleAvatarClick}
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg border-2 border-white group-hover:bg-blue-700 transition-colors hover:scale-110"
              title="Change avatar"
            >
              <FaCamera />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4 tracking-tight drop-shadow-sm">Edit Account</h1>
        </div>
        <form className="space-y-10 px-8 pb-8 pt-2" onSubmit={handleSave}>
          {/* Account Details Card */}
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <FaIdBadge className="text-blue-600 text-2xl" />
              <span className="text-xl font-bold text-blue-700 tracking-wide">Account Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Username', name: 'username', type: 'text', required: true },
                { label: 'Email', name: 'email', type: 'email', required: true },
                { label: 'First Name', name: 'first_name', type: 'text' },
                { label: 'Last Name', name: 'last_name', type: 'text' },
                { label: 'Phone Number', name: 'phone_number', type: 'text' },
                { label: 'User Type', name: 'user_type', type: 'text', readOnly: true },
              ].map((field) => (
                <div key={field.name} className="relative">
                  <input
                    name={field.name}
                    type={field.type}
                    value={userData[field.name] || ''}
                    onChange={handleUserChange}
                    required={field.required}
                    readOnly={field.readOnly}
                    className={clsx(
                      'peer w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all',
                      field.readOnly && 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                    placeholder=" "
                  />
                  <label
                    className="absolute left-4 top-3 text-gray-500 text-sm pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-600 bg-white/80 px-1 rounded"
                  >
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Divider */}
          {jobSeekerData && <div className="flex items-center justify-center my-2"><div className="h-1 w-16 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-40"></div></div>}
          {/* Job Seeker Details Card */}
          {jobSeekerData && (
            <div className="rounded-2xl border border-purple-100 bg-white/80 p-8 shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6">
                <FaUserGraduate className="text-purple-600 text-2xl" />
                <span className="text-xl font-bold text-purple-700 tracking-wide">Job Seeker Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Resume Text', name: 'resume_text', type: 'textarea' },
                  { label: 'Education', name: 'education', type: 'text' },
                  { label: 'Experience Years', name: 'experience_years', type: 'number' },
                  { label: 'Current Job Title', name: 'current_job_title', type: 'text' },
                  { label: 'Desired Job Title', name: 'desired_job_title', type: 'text' },
                  { label: 'Desired Salary', name: 'desired_salary', type: 'number' },
                  { label: 'Location Preference', name: 'location_preference', type: 'text' },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={jobSeekerData[field.name] || ''}
                        onChange={handleJobSeekerChange}
                        className="peer w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all min-h-[60px]"
                        placeholder=" "
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        value={jobSeekerData[field.name] || ''}
                        onChange={handleJobSeekerChange}
                        className="peer w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                        placeholder=" "
                      />
                    )}
                    <label
                      className="absolute left-4 top-3 text-gray-500 text-sm pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-purple-600 bg-white/80 px-1 rounded"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Buttons */}
          <div className="flex justify-end mt-8 gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-full shadow hover:bg-gray-300 transition-colors"
              onClick={() => window.location.reload()}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-60"
              disabled={saving}
            >
              <FaSave /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount; 