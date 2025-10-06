import React, { useState } from "react";
import { FaTimes, FaPaperclip } from "react-icons/fa";
import { JobListing } from "../types/types";
import { useToast } from "../ToastContainer";
// import { handleJobApplicationError } from "../../src/utils/errorHandler";

interface ApplyModalProps {
  job: JobListing;
  onClose: () => void;
  onApply: (resume: File | null, coverLetter: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ 
    job, 
    onClose, 
    onApply, 
    isSubmitting = false,
    // error = null
}) => {
    const [resume, setResume] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [, setFileError] = useState<string | null>(null);
    const { showToast } = useToast();
    // console.log('ApplyModal job:', job);

    // Defensive: If employer_id is missing, show a warning and do not show the form
    if (!job.employer_id || Number(job.employer_id) === 0) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          ></div>
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Cannot Applyasd</h2>
            <p className="mb-4 text-gray-700 text-center">
              Employer information is missing for this job. Please contact support or try another job.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file) {
        const allowedTypes = ['application/pdf', 'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          const errorMessage = "Invalid file type. Only PDF and Word documents are allowed";
          setFileError(errorMessage);
          showToast({
            type: 'warning',
            title: 'Invalid File Type',
            message: errorMessage,
            autoHide: true,
            autoHideDelay: 4000
          });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          const errorMessage = "File too large (max 5MB)";
          setFileError(errorMessage);
          showToast({
            type: 'warning',
            title: 'File Too Large',
            message: errorMessage,
            autoHide: true,
            autoHideDelay: 4000
          });
          return;
        }
      }
      setResume(file);
      setFileError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Require resume before submitting
        if (!resume) {
          const errorMessage = "Resume is required to apply.";
          showToast({
            type: 'warning',
            title: 'Missing Resume',
            message: errorMessage,
            autoHide: true,
            autoHideDelay: 4000
          });
          return;
        }

        // ✅ Optional cover letter, must be at least 20 chars if provided
        if (coverLetter && coverLetter.length < 20) {
          const errorMessage = "Cover letter too short (min 20 characters)";
          showToast({
            type: 'warning',
            title: 'Cover Letter Too Short',
            message: errorMessage,
            autoHide: true,
            autoHideDelay: 4000
          });
          return;
        }

        await onApply(resume, coverLetter);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
                className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Apply for {job.title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Removed inline error box since toast handles errors */}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        {/* ✅ Resume is required (red asterisk) */}
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Resume <span className="text-red-500">*</span> (PDF/DOC/DOCX, max 5MB)
                        </label>
                        <div className="flex items-center">
                            <label className={`cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md flex items-center ${isSubmitting ? 'opacity-50' : ''}`}>                             
                                <FaPaperclip className="mr-2" />
                                {resume ? resume.name : "Choose File"}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isSubmitting}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Letter (Optional, min 20 chars)
                        </label>
                        <textarea
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isSubmitting ? 'opacity-50' : ''}`}
                            rows={4}
                            placeholder="Why are you a good fit for this role?"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${isSubmitting ? 'opacity-50' : ''}`}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center ${isSubmitting ? 'opacity-50' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyModal;
