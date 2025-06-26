import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

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
    work_mode: string;
    salary_range_min?: number;
    salary_range_max?: number;
    expiration_date?: string;
    required_skills: RequiredSkill[];
    idempotencyKey?: string;
  }) => Promise<void>;
};

// Custom deep equality check function
const deepEqual = (x: any, y: any): boolean => {
  if (x === y) return true;
  if (typeof x !== 'object' || x === null || typeof y !== 'object' || y === null) return false;
  
  const keysX = Object.keys(x);
  const keysY = Object.keys(y);
  
  if (keysX.length !== keysY.length) return false;
  
  for (const key of keysX) {
    if (!keysY.includes(key)) return false;
    if (!deepEqual(x[key], y[key])) return false;
  }
  
  return true;
};

const CreatePositionModal = ({
  isOpen,
  onClose,
  onSubmit,
}: JobPostingModalProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    job_title: "",
    job_description: "",
    job_requirements: "",
    job_location: "",
    job_type: "",
    work_mode: "",
    salary_range_min: "",
    salary_range_max: "",
    expiration_date: "",
    required_skills: [] as Array<{
      id?: number;
      skill_name: string;
      is_required: boolean;
      importance_level: number;
      category?: string;
    }>,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<
    Array<{
      id: number;
      name: string;
      category: string | null;
    }>
  >([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [submissionIdempotencyKey, setSubmissionIdempotencyKey] = useState<string | null>(null);
  const [lastSubmissionData, setLastSubmissionData] = useState<any>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);

  const callHonoApi = async (endpoint: string, method: string, body?: any) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      handleSessionExpired();
      throw new Error("Session expired");
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Session expired");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    return await response.json();
  };

  const workModeOptions = [
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "On-site", label: "On-site" },
    { value: "Unknown", label: "Not Specified" },
  ];

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return undefined;
    return new Date(dateString).toISOString();
  };

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchSkills = async () => {
      if (!isOpen) return;

      setIsLoadingSkills(true);
      try {
        const response = await callHonoApi("/api/getAllSkill", "GET");
        if (response.success) {
          setAvailableSkills(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [isOpen]);

  const addSkill = (skill?: { id?: number; name: string; category: string | null }) => {
    if (skill) {
      // Add existing skill from dropdown
      setFormData((prev) => ({
        ...prev,
        required_skills: [
          ...prev.required_skills,
          {
            id: skill.id,
            skill_name: skill.name,
            category: skill.category || "Technical",
            is_required: true,
            importance_level: 1,
          },
        ],
      }));
    } else if (newSkillName.trim()) {
      // Add custom skill
      setFormData((prev) => ({
        ...prev,
        required_skills: [
          ...prev.required_skills,
          {
            skill_name: newSkillName.trim(),
            category: "Technical",
            is_required: true,
            importance_level: 1,
          },
        ],
      }));
      setNewSkillName("");
      setShowSkillInput(false);
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index),
    }));
  };

  const handleSkillChange = (index: number, field: string, value: any) => {
    if (field === "skill_name") {
      value = String(value);
    }

    setFormData((prev) => {
      const updatedSkills = [...prev.required_skills];
      updatedSkills[index] = { ...updatedSkills[index], [field]: value };
      return { ...prev, required_skills: updatedSkills };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a new idempotency key if none exists or if form data changed
    const currentFormData = {
      job_title: formData.job_title,
      job_description: formData.job_description,
      job_requirements: formData.job_requirements,
      job_location: formData.job_location,
      job_type: formData.job_type,
      work_mode: formData.work_mode,
      salary_range_min: formData.salary_range_min,
      salary_range_max: formData.salary_range_max,
      expiration_date: formData.expiration_date,
      required_skills: formData.required_skills
    };
    
    const shouldGenerateNewKey = !submissionIdempotencyKey || 
      !deepEqual(currentFormData, lastSubmissionData);
    
    if (shouldGenerateNewKey) {
      const newKey = crypto.randomUUID();
      setSubmissionIdempotencyKey(newKey);
      setLastSubmissionData(currentFormData);
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Validate form data
      if (!formData.job_title.trim() || !formData.job_description.trim()) {
        throw new Error("Job title and description are required");
      }

      // Validate skills
      const skillErrors = formData.required_skills
        .map((skill, index) =>
          !skill.skill_name?.trim()
            ? `Skill #${index + 1} must have a name`
            : null
        )
        .filter(Boolean);

      if (skillErrors.length > 0) {
        throw new Error(skillErrors.join("\n"));
      }

      // Prepare payload with proper skill structure
      const payload = {
        job_title: formData.job_title,
        job_description: formData.job_description,
        job_requirements: formData.job_requirements,
        job_location: formData.job_location,
        job_type: formData.job_type,
        work_mode: formData.work_mode,
        salary_range_min: formData.salary_range_min
          ? Number(formData.salary_range_min)
          : undefined,
        salary_range_max: formData.salary_range_max
          ? Number(formData.salary_range_max)
          : undefined,
        expiration_date: formatDateForAPI(formData.expiration_date),
        required_skills: (formData.required_skills || [])
          .filter((skill) => skill.skill_name && skill.skill_name.trim() !== "")
          .map((skill) => ({
            id: skill.id,
            skill_name: skill.skill_name.trim(),
            category: skill.category || "Technical",
            is_required: skill.is_required !== false,
            importance_level: skill.importance_level || 1,
          })),
        idempotencyKey: submissionIdempotencyKey ?? undefined
      };

      console.log("🚀 Payload to be sent:", JSON.stringify(payload, null, 2));
      console.log("Using idempotency key:", submissionIdempotencyKey);

      await onSubmit(payload);
      
      // Reset on success
      setSubmissionIdempotencyKey(null);
      setLastSubmissionData(null);
      setIsSuccess(true);

      setTimeout(() => {
        setFormData({
          job_title: "",
          job_description: "",
          job_requirements: "",
          job_location: "",
          job_type: "",
          work_mode: "",
          salary_range_min: "",
          salary_range_max: "",
          expiration_date: "",
          required_skills: [],
        });
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating job posting:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      // Don't reset the idempotency key on error to allow retries
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                <label
                  htmlFor="job_title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="job_description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="job_requirements"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  <label
                    htmlFor="job_location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                  <label
                    htmlFor="job_type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                  <label
                    htmlFor="work_mode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Work Mode*
                  </label>
                  <select
                    id="work_mode"
                    name="work_mode"
                    value={formData.work_mode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    {workModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="expiration_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    id="expiration_date"
                    name="expiration_date"
                    value={formData.expiration_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="salary_range_min"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                  <label
                    htmlFor="salary_range_max"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <div className="mb-4">
                  <select
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      if (!selectedId) return;
                      const selectedSkill = availableSkills.find(
                        (s) => s.id === selectedId
                      );
                      if (selectedSkill) {
                        addSkill({
                          id: selectedSkill.id,
                          name: selectedSkill.name,
                          category: selectedSkill.category,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isLoadingSkills}
                  >
                    <option value="">Select from existing skills</option>
                    {availableSkills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}{" "}
                        {skill.category ? `(${skill.category})` : ""}
                      </option>
                    ))}
                  </select>
                  {isLoadingSkills && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loading skills...
                    </p>
                  )}
                </div>
                <div>
                  {formData.required_skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border rounded p-2 my-1"
                    >
                      <span>
                        {skill.skill_name} ({skill.category})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {showSkillInput ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Enter skill name"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      disabled={!newSkillName.trim()}
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillInput(false);
                        setNewSkillName("");
                      }}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSkillInput(true)}
                    className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    aria-label="Add skill"
                  >
                    + Add Custom Skill
                  </button>
                )}
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
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePositionModal;