import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from "../UserAvatar";

const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [jobSeekerData, setJobSeekerData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        // Fetch user info
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUserData(data.data || data); // handle both {data: ...} and direct
        // Fetch user photo
        const photoRes = await fetch(`/api/photos/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          setPhotoUrl(photoData?.data?.photo_url || null);
        } else {
          setPhotoUrl(null);
        }
        // Fetch job seeker info
        const seekerRes = await fetch(`/api/jobseeker/${user.id}`);
        const seekerData = await seekerRes.json();
        if (seekerData.success) setJobSeekerData(seekerData.jobSeeker);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!userData) return <div className="p-8 text-center text-gray-500">No user data found.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Profile</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center">
          <UserAvatar
            photoUrl={photoUrl ? `http://localhost:3111${photoUrl}` : undefined}
            firstName={userData.first_name}
            lastName={userData.last_name}
            size="lg"
            className="h-16 w-16 mr-4"
          />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {userData.first_name} {userData.last_name}
            </h3>
            <div className="text-gray-600 mt-1">
              <span className="mr-4"><strong>Email:</strong> {userData.email}</span>
              <span><strong>Phone:</strong> {userData.phone_number || "-"}</span>
            </div>
            <div className="text-gray-500 mt-1 text-sm">
              <span className="mr-4"><strong>User Type:</strong> {userData.user_type}</span>
              <span><strong>Joined:</strong> {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : "-"}</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {jobSeekerData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-md font-medium text-gray-900 mb-2">Information</h5>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Education:</strong> {jobSeekerData.education || "-"}</li>
                  <li><strong>Experience (years):</strong> {jobSeekerData.experience_years ?? "-"}</li>
                  <li><strong>Current Job Title:</strong> {jobSeekerData.current_job_title || "-"}</li>
                  <li><strong>Desired Job Title:</strong> {jobSeekerData.desired_job_title || "-"}</li>
                  <li><strong>Desired Salary:</strong> {jobSeekerData.desired_salary ? `₱${jobSeekerData.desired_salary}` : "-"}</li>
                  <li><strong>Location Preference:</strong> {jobSeekerData.location_preference || "-"}</li>
                  <li><strong>Disability:</strong> {jobSeekerData.disability || "-"}</li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Resume & Skills</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Resume Text:</strong> {jobSeekerData.resume_text ? <span className="block max-h-32 overflow-y-auto bg-gray-50 p-2 rounded mt-1">{jobSeekerData.resume_text}</span> : "-"}</li>
                  <li><strong>Resume File:</strong> {jobSeekerData.resume_file_path ? <a href={`http://localhost:3111${jobSeekerData.resume_file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a> : "-"}</li>
                  <li><strong>Skills:</strong> {Array.isArray(jobSeekerData.skills) && jobSeekerData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {jobSeekerData.skills.map((skill: any) => (
                        <span key={skill.id} className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : "-"}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No job seeker profile found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;