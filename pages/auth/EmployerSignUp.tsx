import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaQuestionCircle,
  FaUser,
} from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

// Type definitions
interface EmployerSignUpFormData {
  username: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  password_hash: string;
  confirmPassword: string;
  agreeToTerms: true;
}

// Validation schema
const employerSignUpSchema = z
  .object({
    companyName: z
      .string()
      .min(1, "Company name is required")
      .max(100, "Company name is too long"),
    contactPerson: z
      .string()
      .min(1, "Contact person is required")
      .max(100, "Name is too long"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username is too long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number is too long"),
    address: z
      .string()
      .min(5, "Address is too short")
      .max(200, "Address is too long"),
    industry: z.string().min(1, "Industry is required"),
    password_hash: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the terms and conditions",
      }),
    }),
  })
  .refine((data) => data.password_hash === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Accessibility focus trap hook
const useFocusTrap = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Tab" && ref.current) {
      const focusableElements = ref.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }, []);

  useEffect(() => {
    const currentRef = ref.current;
    currentRef?.addEventListener("keydown", handleKeyDown);

    return () => {
      currentRef?.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return ref;
};

const EmployerSignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const formRef = useFocusTrap();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerSignUpFormData>({
    resolver: zodResolver(employerSignUpSchema),
    defaultValues: {
      agreeToTerms: true,
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<EmployerSignUpFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/employers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username, // Added this
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          companyDescription: data.address,
          industry: data.industry,
          password: data.password_hash,
          companySize: "1-10",
          websiteUrl: "",
          foundedYear: new Date().getFullYear(),
          user_type: "employer", // Added this
          is_active: true, // Added this
        }),
        credentials: "include",
      });

      // First check if the response is OK (status 2xx)
      if (!response.ok) {
        // Try to parse error response as JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, use the status text
          throw new Error(response.statusText || "Registration failed");
        }
        throw new Error(errorData.message || "Registration failed");
      }

      // If successful, parse the JSON response
      const responseData = await response.json();

      // Success handling
      sessionStorage.setItem("registrationSuccess", "true");
      navigate("/", {
        state: {
          fromRegistration: true,
          message: "Registration successful! Welcome to our platform.",
        },
        replace: true,
      });
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden"
      style={{
        backgroundPosition: `${50 + mousePosition.x * 5}% ${
          50 + mousePosition.y * 5
        }%`,
      }}
    >
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-indigo-200 opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-purple-200 opacity-20 blur-xl"></div>

      {/* Full-page layout */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center min-h-screen">
        {/* Left side - Branding/Info */}
        <div className="w-full md:w-1/2 lg:w-2/5 mb-8 md:mb-0 md:pr-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <div className="relative">
                <FaBuilding className="text-indigo-600 text-4xl mr-3" />
                <motion.div
                  className="absolute -inset-2 bg-indigo-100 rounded-full -z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold text-gray-800">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Employer Portal
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Create your employer account to access talented candidates and
              post job opportunities.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">
                  Access a diverse pool of qualified candidates
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">
                  Post unlimited job listings
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">
                  Get matched with candidates based on your needs
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right side - Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full md:w-1/2 lg:w-2/5 max-w-md bg-white rounded-xl shadow-xl p-8 relative z-10"
          ref={formRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-heading"
        >
          {/* Help button */}
          <div className="absolute top-4 right-4">
            <button
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
              onFocus={() => setShowHelpTooltip(true)}
              onBlur={() => setShowHelpTooltip(false)}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              aria-label="Help"
            >
              <FaQuestionCircle className="text-lg" />
            </button>
            <AnimatePresence>
              {showHelpTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-20"
                >
                  <p className="text-sm text-gray-600">
                    Need help signing up? Contact our employer support team at{" "}
                    <span className="text-indigo-600">employers@j4all.com</span>{" "}
                    or call{" "}
                    <span className="text-indigo-600">1-800-EMPLOYER</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <h2
              id="signup-heading"
              className="text-2xl font-bold text-gray-800 text-center"
            >
              Employer Registration
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Create your employer account
            </p>

            {/* Company Name field */}
            <div className="space-y-2">
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <input
                  id="companyName"
                  type="text"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Your Company Inc."
                  aria-invalid={!!errors.companyName}
                  aria-describedby="companyName-error"
                  {...register("companyName")}
                />
              </div>
              {errors.companyName && (
                <motion.p
                  id="companyName-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.companyName.message}
                </motion.p>
              )}
            </div>

            {/* Contact Person field */}
            <div className="space-y-2">
              <label
                htmlFor="contactPerson"
                className="block text-sm font-medium text-gray-700"
              >
                Contact Person
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="text-gray-400" />
                </div>
                <input
                  id="contactPerson"
                  type="text"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.contactPerson ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="John Smith"
                  aria-invalid={!!errors.contactPerson}
                  aria-describedby="contactPerson-error"
                  {...register("contactPerson")}
                />
              </div>
              {errors.contactPerson && (
                <motion.p
                  id="contactPerson-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.contactPerson.message}
                </motion.p>
              )}
            </div>
            {/* Username field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Username"
                  aria-invalid={!!errors.username}
                  aria-describedby="username-error"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <motion.p
                  id="username-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.username.message}
                </motion.p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="contact@yourcompany.com"
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <motion.p
                  id="email-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="(123) 456-7890"
                  aria-invalid={!!errors.phone}
                  aria-describedby="phone-error"
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <motion.p
                  id="phone-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.phone.message}
                </motion.p>
              )}
            </div>

            {/* Address field */}
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Company Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  id="address"
                  type="text"
                  autoComplete="street-address"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="123 Business Ave"
                  aria-invalid={!!errors.address}
                  aria-describedby="address-error"
                  {...register("address")}
                />
              </div>
              {errors.address && (
                <motion.p
                  id="address-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.address.message}
                </motion.p>
              )}
            </div>

            {/* Industry field */}
            <div className="space-y-2">
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-gray-700"
              >
                Industry
              </label>
              <select
                id="industry"
                className={`block w-full px-3 py-2 border ${
                  errors.industry ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                aria-invalid={!!errors.industry}
                aria-describedby="industry-error"
                {...register("industry")}
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="construction">Construction</option>
                <option value="hospitality">Hospitality</option>
                <option value="other">Other</option>
              </select>
              {errors.industry && (
                <motion.p
                  id="industry-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.industry.message}
                </motion.p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password_hash ? "border-red-500" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password_hash}
                  aria-describedby="password-error"
                  {...register("password_hash")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-500 transition-colors" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-500 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password_hash && (
                <motion.p
                  id="password-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password_hash.message}
                </motion.p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirmPassword-error"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-500 transition-colors" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-500 transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  id="confirmPassword-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                  {...register("agreeToTerms")}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                  </a>
                </label>
                {errors.agreeToTerms && (
                  <motion.p
                    className="text-red-600 mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.agreeToTerms.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all mt-4`}
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
                  Creating account...
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
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>
            <motion.div
              className="mt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <a
                href="/"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerSignUpForm;
