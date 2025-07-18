import React, { useEffect, useState, useRef } from 'react';
import { FaUser, FaIdBadge, FaUserGraduate, FaSave, FaCamera, FaTimes, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';
import UserAvatar from '../../components/UserAvatar';
import { getFullPhotoUrl } from '../../components/utils/photo';
import clsx from 'clsx';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [jobSeekerData, setJobSeekerData] = useState<any>(null);
  const [employerData, setEmployerData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (loading) return;
    if (!user) {
      onClose();
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
        if (user.user_type === 'employer') {
          const employerRes = await fetch(`/api/employer-by-user/${user.id}`);
          const employerData = await employerRes.json();
          if (employerData.success) setEmployerData(employerData.employer);
        } else {
          setEmployerData(null);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchUserData();
  }, [user, loading, isOpen, onClose]);

  // Handle input changes
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
  const handleJobSeekerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobSeekerData({ ...jobSeekerData, [e.target.name]: e.target.value });
  };
  const handleEmployerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployerData({ ...employerData, [e.target.name]: e.target.value });
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving data');
      showToast({ type: 'error', message: err.message || 'Error saving data', autoHide: true, autoHideDelay: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-blue-100 bg-white/70 backdrop-blur-lg transition-all duration-300
        md:mt-0 md:mb-0 md:scale-100 md:max-h-[90vh] overflow-y-auto
        min-h-[100vh] md:min-h-0 md:h-auto
        flex flex-col md:flex-row justify-center"
        style={{
          maxWidth: '56rem',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 bg-white/80 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 z-10"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
        {/* Left: Avatar and user info */}
        <div className="md:w-1/3 w-full flex flex-col items-center justify-center py-10 px-6 bg-gradient-to-b from-blue-100/60 to-purple-100/40 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none shadow-md">
          <div className="relative group shadow-lg rounded-full bg-white/80 p-2 ring-4 ring-blue-200 mb-4">
            <UserAvatar
              photoUrl={avatarFile ? avatarPreview : getFullPhotoUrl(userPhotoUrl)}
              firstName={userData?.first_name}
              lastName={userData?.last_name}
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
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2 tracking-tight drop-shadow-sm text-center">
            {userData?.first_name || ''} {userData?.last_name || ''}
          </h1>
          <div className="text-gray-500 text-sm mt-1 text-center break-all">{userData?.email}</div>
        </div>
        {/* Right: Form */}
        <form className="flex-1 space-y-10 px-8 pb-8 pt-10 md:pt-8 md:pb-8" onSubmit={handleSave}>
          {/* Account Details Card */}
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <FaIdBadge className="text-blue-600 text-2xl" />
              <span className="text-xl font-bold text-blue-700 tracking-wide">Account Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ label: 'Username', name: 'username', type: 'text', required: true },
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
                    value={userData?.[field.name] || ''}
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
          {/* Job Seeker Details */}
          {jobSeekerData && (
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6">
                <FaUserGraduate className="text-blue-600 text-2xl" />
                <span className="text-xl font-bold text-blue-700 tracking-wide">Job Seeker Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Resume Text</label>
                  <textarea name="resume_text" value={jobSeekerData.resume_text || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 min-h-[40px]" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Resume File Path</label>
                  <input name="resume_file_path" type="text" value={jobSeekerData.resume_file_path || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Education</label>
                  <input name="education" type="text" value={jobSeekerData.education || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Experience Years</label>
                  <input name="experience_years" type="number" value={jobSeekerData.experience_years ?? ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Current Job Title</label>
                  <input name="current_job_title" type="text" value={jobSeekerData.current_job_title || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Desired Job Title</label>
                  <input name="desired_job_title" type="text" value={jobSeekerData.desired_job_title || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Desired Salary</label>
                  <input name="desired_salary" type="number" value={jobSeekerData.desired_salary ?? ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Location Preference</label>
                  <input name="location_preference" type="text" value={jobSeekerData.location_preference || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-600 text-sm mb-1">Disability</label>
                  <input name="disability" type="text" value={jobSeekerData.disability || ''} onChange={handleJobSeekerChange} className="w-full bg-gray-50 rounded-lg px-4 py-2 border border-gray-200" />
                </div>
              </div>
            </div>
          )}
          {/* Employer Details Card */}
          {userData?.user_type === 'employer' && employerData && (
            <div className="rounded-2xl border border-green-100 bg-white/80 p-8 shadow-md transition-all mb-8">
              <div className="flex items-center gap-3 mb-6">
                <FaBriefcase className="text-green-600 text-2xl" />
                <span className="text-xl font-bold text-green-700 tracking-wide">Employer Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Company Name', name: 'company_name' },
                  { label: 'Contact Person', name: 'contact_person' },
                  { label: 'Industry', name: 'industry' },
                  { label: 'Company Size', name: 'company_size' },
                  { label: 'Website URL', name: 'website_url' },
                  { label: 'Founded Year', name: 'founded_year' },
                  { label: 'Address', name: 'address' },
                  { label: 'Description', name: 'company_description' },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <input
                      name={field.name}
                      className="peer w-full px-4 py-3 bg-white/60 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                      value={employerData[field.name] || ''}
                      onChange={handleEmployerChange}
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-gray-500 text-sm pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-green-600 bg-white/80 px-1 rounded">
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
              onClick={onClose}
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

export default EditAccountModal; 