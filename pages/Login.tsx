import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaAccessibleIcon, FaGlobeAmericas, FaQuestionCircle } from 'react-icons/fa';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

// Type definitions
type UserType = 'general' | 'pwd' | 'indigenous';

interface LoginFormData {
  email: string;
  password: string;
  userType: UserType;
  rememberMe: boolean;
}

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.enum(['general', 'pwd', 'indigenous']),
  rememberMe: z.boolean()
});

// Accessibility focus trap hook
const useFocusTrap = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && ref.current) {
      const focusableElements = ref.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }, []);

  React.useEffect(() => {
    const currentRef = ref.current;
    currentRef?.addEventListener('keydown', handleKeyDown);

    return () => {
      currentRef?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return ref;
};

const UserTypeButton: React.FC<{
  type: UserType;
  currentType: UserType;
  onChange: (type: UserType) => void;
}> = ({ type, currentType, onChange }) => {
  const isActive = type === currentType;
  const labelMap: Record<UserType, string> = {
    general: 'General User',
    pwd: 'Person with Disability',
    indigenous: 'Indigenous Person'
  };

  const iconMap: Record<UserType, JSX.Element> = {
    general: <FaUser className="mr-1" />,
    pwd: <FaAccessibleIcon className="mr-1" />,
    indigenous: <FaGlobeAmericas className="mr-1" />
  };

  return (
    <motion.button
      type="button"
      onClick={() => onChange(type)}
      className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      whileHover={{ scale: isActive ? 1 : 1.03 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isActive}
    >
      {iconMap[type]}
      <span>{labelMap[type]}</span>
    </motion.button>
  );
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const formRef = useFocusTrap();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userType: 'general',
      rememberMe: false,
    },
  });

  const userType = watch('userType');

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    
    // Simulate loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the form data (optional)
    console.log('Form submitted:', data);
    
    // Redirect to admin welcome page
    navigate('/IndigenousDashboard');
    
    setIsSubmitting(false);
  };

  // Add subtle background animation
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden"
      style={{
        backgroundPosition: `${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%`
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
                <FaAccessibleIcon className="text-indigo-600 text-4xl mr-3" />
                <motion.div 
                  className="absolute -inset-2 bg-indigo-100 rounded-full -z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <div className="relative">
                <FaGlobeAmericas className="text-indigo-600 text-4xl" />
                <motion.div 
                  className="absolute -inset-2 bg-indigo-100 rounded-full -z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                J4All
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Connect with people and access resources designed for your needs.
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">Personalized experience based on your user type</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">Secure and accessible for all users</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">Connect with relevant communities</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full md:w-1/2 lg:w-2/5 max-w-md bg-white rounded-xl shadow-xl p-8 relative z-10"
          ref={formRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-heading"
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
                    Need help logging in? Contact support at <span className="text-indigo-600">help@j4all.com</span> or call <span className="text-indigo-600">1-800-HELP-NOW</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <h2 id="login-heading" className="text-2xl font-bold text-gray-800 text-center">
              Welcome Back
            </h2>
            <p className="text-center text-gray-500">
              Please enter your details to sign in
            </p>

            {/* User type selector */}
            <fieldset className="space-y-2">
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {(['general', 'pwd', 'indigenous'] as UserType[]).map((type) => (
                  <UserTypeButton
                    key={type}
                    type={type}
                    currentType={userType}
                    onChange={(t) => setValue('userType', t)}
                  />
                ))}
              </div>
            </fieldset>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="your@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  {...register('email')}
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

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-indigo-600 hover:text-indigo-500 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'} password
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-500 transition-colors" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-500 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  id="password-error"
                  className="text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                  {...register('rememberMe')}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all`}
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
                'Sign in'
              )}
            </motion.button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to J4All?
                </span>
              </div>
            </div>
            <motion.div 
              className="mt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <a
                href="#"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create New Account
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;