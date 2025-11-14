import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, FaLock, FaEye, FaEyeSlash, FaBuilding, FaCheck, 
   FaTrash, FaPlus,  FaFileAlt, FaTimes,
  FaExclamationCircle, FaCheckCircle
} from "react-icons/fa";

export default function EmployerSignupForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'error' | 'success';
  }>({
    show: false,
    message: '',
    type: 'error'
  });

  // Profile photo state (single photo)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // Verification documents states (3 documents)
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);
  const [verificationPreviews, setVerificationPreviews] = useState<string[]>([]);
  const MAX_VERIFICATION_DOCS = 3;

  interface FormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyName: string;
    contactPerson: string;
    industry: string;
    companySize: string;
    websiteUrl: string;
    foundedYear: number | string;
    address: string;
    agreeToTerms: boolean;
    userType: "EMPLOYER";
    logo_path?: FileList;
  }

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>();

  const passwordValue = watch("password");

  // Show toast notification
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ show: true, message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 3000);
  };

  // Handle profile photo selection (single photo)
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast(`${file.name} is not an image file`, 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name} is too large. Max size is 5MB`, 'error');
      return;
    }

    setProfilePhoto(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // Remove profile photo
  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePreview(null);
  };

  // Handle verification documents selection (multiple)
  const handleVerificationDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (verificationDocs.length + files.length > MAX_VERIFICATION_DOCS) {
      showToast(`You can only upload up to ${MAX_VERIFICATION_DOCS} verification documents`, 'error');
      return;
    }

    const validFiles = files.filter(file => {
      // Validate file type (images and PDFs)
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        showToast(`${file.name} must be an image or PDF file`, 'error');
        return false;
      }
      // Validate file size (max 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} is too large. Max size is 10MB`, 'error');
        return false;
      }
      return true;
    });

    // Add new files
    setVerificationDocs(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Remove a verification document
  const removeVerificationDoc = (index: number) => {
    setVerificationDocs(prev => prev.filter((_, i) => i !== index));
    setVerificationPreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    // Validate profile photo
    if (!profilePhoto) {
      showToast("Profile photo is required", 'error');
      return;
    }

    // Validate verification documents
    if (verificationDocs.length === 0) {
      showToast("At least one verification document is required (BIR, Business Permit, DTI, etc.)", 'error');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const formData = new FormData();

      const phoneNumber = data.phone.replace(/^(\+63|63)/, '');
      const fullPhoneNumber = `+63${phoneNumber}`;

      const payload = {
        user: {
          username: data.username,
          email: data.email.toLowerCase(),
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: fullPhoneNumber,
          userType: "EMPLOYER" as const
        },
        employer: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          industry: data.industry,
          companySize: data.companySize,
          websiteUrl: data.websiteUrl,
          foundedYear: Number(data.foundedYear),
          address: data.address
        },
        confirmPassword: data.confirmPassword,
        agreeToTerms: data.agreeToTerms
      };

      formData.append('data', JSON.stringify(payload));

      // Append company logo
      if (data.logo_path && data.logo_path[0]) {
        formData.append('logo', data.logo_path[0]);
      }

      // Append profile photo
      formData.append('profilePhoto', profilePhoto);

      // Append verification documents
      verificationDocs.forEach((file, index) => {
        formData.append(`verificationDoc_${index}`, file);
      });
      formData.append('verificationDocsCount', verificationDocs.length.toString());

      const response = await axios.post("/api/createEmployer", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        showToast("Account created successfully! Please check your email.", 'success');
        setTimeout(() => {
          navigate('/verify-email', {
            state: { 
              fromRegistration: true,
              email: data.email,
              message: 'Please verify your email to activate your employer account.' 
            },
            replace: true
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error("Full error object:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors?.fieldErrors) {
          const fieldErrors = errorData.errors.fieldErrors;
          const errorMessages = [];
          
          for (const [field, errors] of Object.entries(fieldErrors)) {
            if (Array.isArray(errors) && errors.length > 0) {
              errorMessages.push(`${field}: ${errors[0]}`);
            }
          }
          
          errorMessage = errorMessages.length > 0 
            ? errorMessages.join(', ') 
            : errorData.error || errorMessage;
        } else if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      }
      
      showToast(errorMessage, 'error');
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 min-w-[300px] max-w-md"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {toast.type === 'error' ? (
                <FaExclamationCircle className="text-xl flex-shrink-0" />
              ) : (
                <FaCheckCircle className="text-xl flex-shrink-0" />
              )}
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => setToast({ show: false, message: '', type: 'error' })}
                className="flex-shrink-0 hover:opacity-70 transition"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-indigo-300 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[32rem] h-[32rem] bg-purple-300 opacity-20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center min-h-screen relative z-10 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/2 lg:w-2/5"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500 rounded-xl text-white">
              <FaBuilding className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              J4PWDs Employers
            </h1>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Join our inclusive hiring platform
          </h2>

          <div className="space-y-3">
            {[
              "Access to diverse talent pool",
              "Streamlined hiring process",
              "Inclusivity-focused tools",
              "Company profile customization",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FaCheck className="w-3 h-3 text-indigo-600" />
                  </div>
                </div>
                <p className="text-gray-600">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-1/2 lg:w-2/5 max-w-2xl"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                {['Account', 'Company', 'Verification'].map((label, idx) => (
                  <div key={idx} className={`flex flex-col items-center ${step >= idx + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= idx + 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                    }`}>
                      {step > idx + 1 ? <FaCheck /> : idx + 1}
                    </div>
                    <span className="text-xs mt-1">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Employer Account</h2>
                <p className="text-gray-600 text-sm mt-1">Fill in your details to get started</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4">
                  {formError}
                </div>
              )}

              <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Account Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="email"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="your@email.com"
                            {...register("email", { 
                              required: "Email is required",
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                              }
                            })}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="username"
                            {...register("username", { required: "Username is required" })}
                          />
                        </div>
                        {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                          <FaLock className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="••••••••"
                            {...register("password", { 
                              required: "Password is required",
                              minLength: { value: 8, message: "Password must be at least 8 characters" }
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                          <FaLock className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="••••••••"
                            {...register("confirmPassword", { 
                              required: "Please confirm password",
                              validate: val => val === passwordValue || "Passwords do not match"
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={async () => {
                            const isValid = await trigger(['email', 'username', 'password', 'confirmPassword']);
                            if (isValid) setStep(2);
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
                        >
                          Next
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Company Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Acme Inc."
                            {...register("companyName", { required: "Company name is required" })}
                          />
                          {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Jane Smith"
                            {...register("contactPerson", { required: "Contact person is required" })}
                          />
                          {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Technology"
                            {...register("industry", { required: "Industry is required" })}
                          />
                          {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            {...register("companySize", { required: "Company size is required" })}
                          >
                            <option value="">Select Size</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501+">501+</option>
                          </select>
                          {errors.companySize && <p className="text-xs text-red-500 mt-1">{errors.companySize.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://company.com"
                            {...register("websiteUrl", { required: "Website URL is required" })}
                          />
                          {errors.websiteUrl && <p className="text-xs text-red-500 mt-1">{errors.websiteUrl.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="2020"
                            {...register("foundedYear", { 
                              required: "Founded year is required",
                              min: { value: 1900, message: "Invalid year" }
                            })}
                          />
                          {errors.foundedYear && <p className="text-xs text-red-500 mt-1">{errors.foundedYear.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          {...register("logo_path")}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="John"
                            {...register("firstName", { required: "First name is required" })}
                          />
                          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Doe"
                            {...register("lastName", { required: "Last name is required" })}
                          />
                          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                            +63
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="9123456789"
                            {...register("phone", { 
                              required: "Phone is required",
                              pattern: { value: /^[0-9]{10}$/, message: "Enter 10 digits" },
                              onChange: (e) => {
                                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              }
                            })}
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="123 Main St, City"
                          {...register("address", { required: "Address is required" })}
                        />
                        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const isValid = await trigger(['companyName', 'contactPerson', 'industry', 'companySize', 'websiteUrl', 'foundedYear', 'firstName', 'lastName', 'phone', 'address']);
                            if (isValid) setStep(3);
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
                        >
                          Next
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Verification Documents</h3>
                      
                      {/* Profile Photo Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Photo <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Upload your professional profile photo</p>
                        
                        {profilePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={profilePreview}
                              alt="Profile"
                              className="w-32 h-32 object-cover rounded-full border-4 border-indigo-200"
                            />
                            <button
                              type="button"
                              onClick={removeProfilePhoto}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                            <FaUser className="text-2xl text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">Add Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePhotoChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Verification Documents Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Documents (Up to {MAX_VERIFICATION_DOCS}) <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Upload documents to verify your business (BIR Certificate, Business Permit, DTI Registration, Mayor's Permit, etc.)
                        </p>
                        
                        {/* Document Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {verificationPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              {verificationDocs[index].type === 'application/pdf' ? (
                                <div className="w-full h-32 border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center bg-red-50">
                                  <FaFileAlt className="text-3xl text-red-500 mb-1" />
                                  <span className="text-xs text-gray-600 text-center px-2 truncate w-full">
                                    {verificationDocs[index].name}
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={preview}
                                  alt={`Document ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => removeVerificationDoc(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          
                          {/* Add Document Button */}
                          {verificationDocs.length < MAX_VERIFICATION_DOCS && (
                            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                              <FaPlus className="text-2xl text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500 text-center px-2">Add Document</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleVerificationDocsChange}
                                className="hidden"
                                multiple
                              />
                            </label>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <p className="text-gray-500 flex items-center gap-1">
                            <FaFileAlt className="text-indigo-500" />
                            {verificationDocs.length} of {MAX_VERIFICATION_DOCS} documents uploaded
                          </p>
                          <p className="text-gray-400">Accepted: Images & PDFs (max 10MB)</p>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            {...register("agreeToTerms", { 
                              validate: value => value === true || "You must accept terms"
                            })}
                          />
                          <span className="text-sm text-gray-600">
                            I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms & Conditions</a> and confirm that all provided documents are authentic and accurate.
                          </span>
                        </label>
                        {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeToTerms.message}</p>}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> Your account will be reviewed by our admin team after email verification. 
                          Approval typically takes 1-2 business days. You'll receive an email notification once approved.
                        </p>
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-600 hover:underline font-semibold">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}