import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaCamera } from "react-icons/fa";
// import { FormData } from "../../components/types/types";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaUserTie,
  FaGlobe,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaBriefcase,
} from "react-icons/fa";

export default function EmployerSignupForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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
    // photo?: FileList; // Not needed, handled by state
  }

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const passwordValue = watch("password");

  // Background animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  setFormError(null);

  try {
    const formData = new FormData();

    // 1. Create the complete payload object that matches your schema
    const payload = {
      user: {
        username: data.username,
        email: data.email.toLowerCase(),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
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

    // 2. Append the JSON string of the complete payload
    formData.append('data', JSON.stringify(payload));

    // 3. Append the logo file separately if exists
    if (data.logo_path && data.logo_path[0]) {
      formData.append('logo', data.logo_path[0]);
    }

    // 4. Append the photo file if it exists
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    // Debug: Log the complete form data before sending
    console.log('Final FormData being sent:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.post("/api/createEmployer", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  } catch (error: any) {
    console.error("Full error:", error);
    const responseData = error?.response?.data;

    // Handle specific error cases
    if (responseData?.errors) {
      // Handle field errors
      if (responseData.errors.fieldErrors) {
        const { user, employer, ...rootErrors } = responseData.errors.fieldErrors;

        // Handle user field errors
        if (user) {
          for (const [field, messages] of Object.entries(user)) {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(`user.${field}` as any, {
                type: "server",
                message: messages[0]
              });
            }
          }
        }

        // Handle employer field errors
        if (employer) {
          for (const [field, messages] of Object.entries(employer)) {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(`employer.${field}` as any, {
                type: "server",
                message: messages[0]
              });
            }
          }
        }

        // Handle root level errors (confirmPassword, agreeToTerms)
        for (const [field, messages] of Object.entries(rootErrors)) {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof FormData, {
              type: "server",
              message: messages[0]
            });
          }
        }
      }

      // Handle form errors
      if (responseData.errors.formErrors?.length) {
        setFormError(responseData.errors.formErrors[0]);
      }
    } else if (responseData?.message) {
      setFormError(responseData.message);
    } else {
      setFormError("An unexpected error occurred. Please try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-50 to-indigo-50"
          style={{
            backgroundPosition: `${50 + mousePosition.x * 3}% ${
              50 + mousePosition.y * 3
            }%`,
          }}
        />
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-100 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-30" />
      </div>

      {/* Success notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              Registration successful! Redirecting to login...
            </span>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center min-h-screen relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 lg:w-2/5 mb-12 md:mb-0 md:pr-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500 rounded-xl text-white">
              <FaBuilding className="text-2xl" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              J4All Employers
            </h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Join our inclusive hiring platform
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Connect with talented professionals from diverse backgrounds. Our
            platform helps you find the right candidates while promoting
            workplace inclusivity.
          </p>

          <div className="space-y-4">
            {[
              "Access to a diverse talent pool",
              "Streamlined hiring process",
              "Inclusivity-focused tools",
              "Company profile customization",
              "Dedicated employer support",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                </div>
                <p className="text-gray-600">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full md:w-3/5 lg:w-2/3 max-w-4xl"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100 rounded-full filter blur-3xl opacity-20" />

            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Create Employer Account
                </h2>
                <p className="text-gray-500">
                  Fill in your company details to get started
                </p>
              </div>

              {/* Form error */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formError}
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Account Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 border-b pb-2">
                    Account Information
                  </h3>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.email ? "border-red-300" : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="your@email.com"
                        {...register("email", {
                          required: "Email is required",
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.username ? "border-red-300" : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="username"
                        {...register("username", {
                          required: "Username is required",
                        })}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-red-500">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaLock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`block w-full pl-10 pr-10 py-2.5 border ${
                          errors.password ? "border-red-300" : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="••••••••"
                        {...register("password", {
                          required: "Password is required",
                          pattern: {
                            value:
                              /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
                            message:
                              "Password must be at least 6 characters and include a number and special character",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaLock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`block w-full pl-10 pr-10 py-2.5 border ${
                          errors.confirmPassword
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (val) =>
                            val === passwordValue || "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Company Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 border-b pb-2">
                    Company Information
                  </h3>

                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaBuilding className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.companyName
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="Acme Inc."
                        {...register("companyName", {
                          required: "Company name is required",
                        })}
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-xs text-red-500">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Person
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUserTie className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.contactPerson
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="Jane Smith"
                        {...register("contactPerson", {
                          required: "Contact person is required",
                        })}
                      />
                    </div>
                    {errors.contactPerson && (
                      <p className="text-xs text-red-500">
                        {errors.contactPerson.message}
                      </p>
                    )}
                  </div>

                  {/* Industry */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Industry
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaBriefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.industry ? "border-red-300" : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="Technology"
                        {...register("industry", {
                          required: "Industry is required",
                        })}
                      />
                    </div>
                    {errors.industry && (
                      <p className="text-xs text-red-500">
                        {errors.industry.message}
                      </p>
                    )}
                  </div>

                  {/* Company Size */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Company Size
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser className="w-4 h-4" />
                      </div>
                      <select
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.companySize
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors appearance-none`}
                        {...register("companySize", {
                          required: "Company size is required",
                        })}
                      >
                        <option value="">Select Company Size</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501+">501+</option>
                      </select>
                    </div>
                    {errors.companySize && (
                      <p className="text-xs text-red-500">
                        {errors.companySize.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 border-b pb-2">
                  Personal Information
                </h3>

                {/* Profile Photo Upload */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Photo
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPhotoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border file:rounded-lg file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Upload a professional photo for your profile (optional)
                  </p>
                </div>

                {/* Photo Preview */}
                {photoPreview && (
                  <div className="mt-4">
                    <img
                      src={photoPreview}
                      alt="Profile Photo Preview"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUserTie className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.firstName
                            ? "border-red-300"
                            : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="John"
                        {...register("firstName", {
                          required: "First name is required",
                        })}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaUserTie className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.lastName ? "border-red-300" : "border-gray-200"
                        } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                        placeholder="Doe"
                        {...register("lastName", {
                          required: "Last name is required",
                        })}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaPhone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.phone ? "border-red-300" : "border-gray-200"
                      } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                      placeholder="+1 (555) 123-4567"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                          message: "Please enter a valid phone number",
                        },
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Company Information (continued) */}
              <div className="space-y-4">
                {/* Website URL */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaGlobe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.websiteUrl ? "border-red-300" : "border-gray-200"
                      } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                      placeholder="https://yourcompany.com"
                      {...register("websiteUrl", {
                        required: "Website URL is required",
                        pattern: {
                          value:
                            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                          message: "Please enter a valid URL",
                        },
                      })}
                    />
                  </div>
                  {errors.websiteUrl && (
                    <p className="text-xs text-red-500">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>

                {/* Founded Year */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Founded Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaCalendarAlt className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.foundedYear
                          ? "border-red-300"
                          : "border-gray-200"
                      } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                      placeholder="2020"
                      {...register("foundedYear", {
                        required: "Founded year is required",
                        min: {
                          value: 1900,
                          message: "Year must be after 1900",
                        },
                        max: {
                          value: new Date().getFullYear(),
                          message: `Year cannot be in the future`,
                        },
                      })}
                    />
                  </div>
                  {errors.foundedYear && (
                    <p className="text-xs text-red-500">
                      {errors.foundedYear.message}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaMapMarkerAlt className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.address ? "border-red-300" : "border-gray-200"
                      } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                      placeholder="123 Main St, City, Country"
                      {...register("address", {
                        required: "Address is required",
                      })}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Company Logo */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border file:rounded-lg file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                    {...register("logo_path")}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2 mt-4">
                <label className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-200 border-gray-300 rounded"
                      {...register("agreeToTerms", {
                        validate: (value) =>
                          value === true || "You must accept terms",
                      })}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-xs text-red-500">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-medium text-white mt-4 ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md"
                } focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all`}
                whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                whileTap={!isSubmitting ? { scale: 0.99 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Employer Account"
                )}
              </motion.button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Sign in to your account
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
