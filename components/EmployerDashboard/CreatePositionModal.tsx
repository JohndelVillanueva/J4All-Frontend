import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

type RequiredSkill = {
  skill_name: string;
  is_required: boolean;
  importance_level: number;
  category?: string;
};

type JobPostingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    job_title: string;
    job_description: string;
    job_requirements: string;
    job_location: string;
    job_type: string;
    salary_range_min?: number;
    salary_range_max?: number;
    expiration_date?: string;
    required_skills: RequiredSkill[];
  }) => Promise<void>;
};

const CreatePositionModal = ({ isOpen, onClose, onSubmit }: JobPostingModalProps) => {
   const navigate = useNavigate();
  const [formData, setFormData] = useState({
    job_title: '',
    job_description: '',
    job_requirements: '',
    job_location: '',
    job_type: '',
    salary_range_min: '',
    salary_range_max: '',
    expiration_date: '',
    required_skills: [] as Array<{
      skill_name: string;
      is_required: boolean;
      importance_level: number;
    }>
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Hono API client configuration
  const callHonoApi = async (endpoint: string, method: string, body?: any) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      handleSessionExpired();
      throw new Error('Session expired');
    }

    const response = await fetch("api/createJob", {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 401) {
      handleSessionExpired();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return await response.json();
  };
  const formatDateForAPI = (dateString: string) => {
  if (!dateString) return undefined;
  return new Date(dateString).toISOString();
};

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');  // Changed from router.push to navigate
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      required_skills: [
        ...prev.required_skills,
        { skill_name: '', is_required: true, importance_level: 1 }
      ]
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }));
  };

  const handleSkillChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedSkills = [...prev.required_skills];
      updatedSkills[index] = { ...updatedSkills[index], [field]: value };
      return { ...prev, required_skills: updatedSkills };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');

  try {
    // Validate form data
    if (!formData.job_title.trim() || !formData.job_description.trim()) {
      throw new Error('Job title and description are required');
    }

    if (formData.required_skills.some(skill => !skill.skill_name.trim())) {
      throw new Error('All skills must have a name');
    }

    // Prepare the payload for Hono
    const payload = {
      job_title: formData.job_title,
      job_description: formData.job_description,
      job_requirements: formData.job_requirements,
      job_location: formData.job_location,
      job_type: formData.job_type,
      salary_range_min: formData.salary_range_min ? Number(formData.salary_range_min) : undefined,
      salary_range_max: formData.salary_range_max ? Number(formData.salary_range_max) : undefined,
      expiration_date: formatDateForAPI(formData.expiration_date),
      required_skills: formData.required_skills.map(skill => ({
        skill_name: skill.skill_name.trim(),
        is_required: skill.is_required,
        importance_level: skill.importance_level,
        category: 'Technical'
      }))
    };

    // Call Hono API endpoint
    const result = await callHonoApi('/createJob', 'POST', payload);

    if (!result.success) {
      throw new Error(result.message || 'Job creation failed');
    }

    await onSubmit(result.data);
    setIsSuccess(true); // Show success message first
    
    // Reset form and close after delay
    setTimeout(() => {
      setFormData({
        job_title: '',
        job_description: '',
        job_requirements: '',
        job_location: '',
        job_type: '',
        salary_range_min: '',
        salary_range_max: '',
        expiration_date: '',
        required_skills: []
      });
      setIsSuccess(false);
      onClose(); // Then close the modal
    }, 2000);
  } catch (error) {
    console.error('Error creating job posting:', error);
    setError(error instanceof Error ? error.message : 'An unknown error occurred');
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred overlay */}
      <div 
        className="fixed inset-0 bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            {isSuccess && (
  <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center">
    <FaCheckCircle className="h-5 w-5 mr-2" />
    Job posting created successfully!
  </div>
)}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title*
                </label>
                <input 
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="job_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description*
                </label>
                <textarea 
                  id="job_description"
                  name="job_description"
                  rows={4}
                  value={formData.job_description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>

              <div>
                <label htmlFor="job_requirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Requirements*
                </label>
                <textarea 
                  id="job_requirements"
                  name="job_requirements"
                  rows={3}
                  value={formData.job_requirements}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="List the requirements for this position..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="job_location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input 
                    type="text"
                    id="job_location"
                    name="job_location"
                    value={formData.job_location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. Remote, New York, etc."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type*
                  </label>
                  <select
                    id="job_type"
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select job type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salary_range_min" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Salary
                  </label>
                  <input 
                    type="number"
                    id="salary_range_min"
                    name="salary_range_min"
                    value={formData.salary_range_min}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. 90000"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="salary_range_max" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Salary
                  </label>
                  <input 
                    type="number"
                    id="salary_range_max"
                    name="salary_range_max"
                    value={formData.salary_range_max}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. 120000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date
                </label>
                <input 
                  type="date"
                  id="expiration_date"
                  name="expiration_date"
                  value={formData.expiration_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                {formData.required_skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={skill.skill_name}
                      onChange={(e) => handleSkillChange(index, 'skill_name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Skill name"
                      required
                    />
                    <select
                      value={skill.importance_level}
                      onChange={(e) => handleSkillChange(index, 'importance_level', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                      aria-label="Remove skill"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  aria-label="Add skill"
                >
                  + Add Skill
                </button>
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Posting...
                </>
              ) : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePositionModal;