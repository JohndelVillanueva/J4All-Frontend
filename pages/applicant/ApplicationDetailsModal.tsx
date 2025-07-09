import React, { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorMessage from '../../components/ErrorMessage';

interface ApplicationDetails {
  id: number;
  job_title: string;
  company: string;
  status: string;
  applied_at: string;
  applicant?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    photo?: string;
  };
  cover_letter?: string;
  resume?: string;
}

interface ApplicationDetailsModalProps {
  applicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMnptMCAyYzQuNDE4IDAgOCAzLjU4MiA4IDhzLTMuNTgyIDgtOCA4LTgtMy41ODItOC04IDMuNTgyLTggOC04eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

const getFullPhotoUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:3111${url}`;
};

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ applicationId, isOpen, onClose }) => {
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId) return;
    const fetchApplication = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (!res.ok) throw new Error('Failed to fetch application details');
        const data = await res.json();
        setApplication(data.data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !application ? (
          <ErrorMessage message="Application not found" />
        ) : (
          <>
            <div className="flex items-center mb-8 border-b pb-6">
              {application.applicant?.photo ? (
                <img
                  src={getFullPhotoUrl(application.applicant.photo) || DEFAULT_PROFILE_IMAGE}
                  alt="Applicant"
                  className="h-16 w-16 rounded-full object-cover mr-4"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_PROFILE_IMAGE;
                  }}
                />
              ) : (
                <img src={DEFAULT_PROFILE_IMAGE} alt="Default Avatar" className="h-16 w-16 rounded-full object-cover mr-4" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {application.applicant?.first_name} {application.applicant?.last_name}
                </h1>
                <div className="text-gray-600 mt-1">
                  <span className="mr-4"><strong>Email:</strong> {application.applicant?.email}</span>
                  <span><strong>Phone:</strong> {application.applicant?.phone_number}</span>
                </div>
              </div>
            </div>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded shadow-sm border">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Job Information</h2>
                <div><strong>Position:</strong> {application.job_title}</div>
                <div><strong>Company:</strong> {application.company}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded shadow-sm border">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Application Details</h2>
                <div><strong>Status:</strong> <span className="capitalize">{application.status}</span></div>
                <div><strong>Applied At:</strong> {new Date(application.applied_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Resume</h2>
              {application.resume ? (
                <a
                  href={getFullPhotoUrl(application.resume) || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {application.applicant && (application.applicant.first_name || application.applicant.last_name)
                    ? `${application.applicant.first_name || ''} ${application.applicant.last_name || ''}`.trim()
                    : 'Resume'}
                  {application.resume ? ` (${application.resume.split('.').pop()?.toUpperCase()})` : ''}
                </a>
              ) : (
                <div className="text-gray-500 italic">No resume uploaded.</div>
              )}
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Cover Letter</h2>
              {application.cover_letter ? (
                <div className="whitespace-pre-line bg-gray-50 p-4 rounded border text-gray-800">
                  {application.cover_letter}
                </div>
              ) : (
                <div className="text-gray-500 italic">No cover letter provided.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailsModal; 