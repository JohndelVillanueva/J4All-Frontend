import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaAccessibleIcon,
  FaGlobeAmericas,
  FaQuestionCircle,
  FaBriefcase,
} from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Type definitions
type UserType = "general" | "pwd" | "indigenous" | "employer";

interface LoginFormData {
  email: string;
  password: string;
  userType: UserType;
  rememberMe: boolean;
}

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["general", "pwd", "indigenous", "employer"]),
  rememberMe: z.boolean(),
});

const UserTypeButton: React.FC<{
  type: UserType;
  currentType: UserType;
  onChange: (type: UserType) => void;
}> = ({ type, currentType, onChange }) => {
  const isActive = type === currentType;
  const labelMap: Record<UserType, string> = {
    general: "General",
    pwd: "PWD",
    indigenous: "Indigenous",
    employer: "Employer",
  };

  const iconMap: Record<UserType, JSX.Element> = {
    general: <FaUser className="w-4 h-4" />,
    pwd: <FaAccessibleIcon className="w-4 h-4" />,
    indigenous: <FaGlobeAmericas className="w-4 h-4" />,
    employer: <FaBriefcase className="w-4 h-4" />,
  };

  return (
    <motion.button
      type="button"
      onClick={() => onChange(type)}
      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
        isActive
          ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg"
          : "bg-white text-gray-600 hover:bg-gray-50 shadow-md"
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isActive}
    >
      <div
        className={`p-2 rounded-full ${
          isActive ? "bg-white/20" : "bg-gray-100"
        }`}
      >
        {iconMap[type]}
      </div>
      <span>{labelMap[type]}</span>
    </motion.button>
  );
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: "general",
      rememberMe: false,
    },
  });

  const userType = watch("userType");
  const rememberMe = watch("rememberMe");

  // Load saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedUserType = localStorage.getItem(
      "rememberedUserType"
    ) as UserType | null;

    if (savedEmail && savedPassword) {
      setValue("email", savedEmail);
      setValue("password", savedPassword);
      setValue("rememberMe", true);
      if (savedUserType) setValue("userType", savedUserType);
    }
  }, [setValue]);

  // Handle registration success message
  useEffect(() => {
    if (
      location.state?.fromRegistration ||
      sessionStorage.getItem("registrationSuccess")
    ) {
      setShowRegistrationSuccess(true);
      sessionStorage.removeItem("registrationSuccess");
      const timer = setTimeout(() => setShowRegistrationSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Form submission
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const response = await axios.post("/api/login", {
        email: data.email,
        password: data.password,
        userType: data.userType,
      });

      // Change this in your frontend onSubmit handler:
      if (
        response.status === 200 &&
        response.data.message === "Login successful"
      ) {
        // Save credentials if "Remember Me" is checked
        if (data.rememberMe) {
          localStorage.setItem("rememberedEmail", data.email);
          localStorage.setItem("rememberedPassword", data.password);
          localStorage.setItem("rememberedUserType", data.userType);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
          localStorage.removeItem("rememberedUserType");
        }

        // Save token
        localStorage.setItem("token", response.data.token);
        console.log('Redirecting to:', data.userType);

        // Redirect based on user type
        switch (data.userType) {
          case "indigenous":
            navigate("/IndigenousDashboard");
            break;
          case "employer":
            navigate("/EmployerDashboard");
            break;
          case "pwd":
            navigate("/PWDDashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        setLoginError(
          response.data.message || "Login failed. Please try again."
        );
      }
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message || "Server error. Please try again later."
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
      <AnimatePresence>
        {showRegistrationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
                Account created successfully! Please log in.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <FaAccessibleIcon className="text-2xl" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              J4All
            </h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to your inclusive community
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Connect with opportunities and resources tailored to your needs. Our
            platform is designed to be accessible for everyone.
          </p>

          <div className="space-y-4">
            {[
              "Personalized experience based on your profile",
              "Secure and accessible platform",
              "Direct connection with relevant opportunities",
              "Support for all user types",
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

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full md:w-1/2 lg:w-2/5 max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100 rounded-full filter blur-3xl opacity-20" />

            {/* Help button */}
            <div className="absolute top-5 right-5">
              <button
                onMouseEnter={() => setShowHelpTooltip(true)}
                onMouseLeave={() => setShowHelpTooltip(false)}
                className="text-gray-400 hover:text-indigo-500 transition-colors"
                aria-label="Help"
              >
                <FaQuestionCircle className="text-xl" />
              </button>
              <AnimatePresence>
                {showHelpTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-20"
                  >
                    <p className="text-sm text-gray-600">
                      Need help? Contact our support team at{" "}
                      <span className="text-indigo-600 font-medium">
                        support@j4all.com
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Welcome back
                </h2>
                <p className="text-gray-500">Sign in to access your account</p>
              </div>

              {/* Error message */}
              {loginError && (
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
                  {loginError}
                </motion.div>
              )}

              {/* User type selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  I am signing in as:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    ["general", "pwd", "indigenous", "employer"] as UserType[]
                  ).map((type) => (
                    <UserTypeButton
                      key={type}
                      type={type}
                      currentType={userType}
                      onChange={(t) => setValue("userType", t)}
                    />
                  ))}
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? "border-red-300" : "border-gray-200"
                    } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                    placeholder="your@email.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaLock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={rememberMe ? "current-password" : "off"}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.password ? "border-red-300" : "border-gray-200"
                    } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

              {/* Remember me & forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-200 border-gray-300 rounded"
                    {...register("rememberMe")}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-medium text-white ${
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
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="/SignUpPage"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Create new account
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
