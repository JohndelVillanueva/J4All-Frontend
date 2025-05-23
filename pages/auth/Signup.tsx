import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaAccessibleIcon, FaGlobeAmericas, FaQuestionCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import type { JSX } from 'react';

// Type definitions
type UserType = 'general' | 'pwd' | 'indigenous';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password_hash: string;
  confirmPassword: string;
  userType: UserType;
  agreeToTerms: true;
}

// Validation schema
const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
  address: z.string().min(5, 'Address is too short').max(100, 'Address is too long'),
  password_hash: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  userType: z.enum(['general', 'pwd', 'indigenous']),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
}).refine((data) => data.password_hash === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Accessibility focus trap hook (same as in login page)
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

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword_hash, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const formRef = useFocusTrap();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userType: 'general',
      agreeToTerms: true,
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const userType = watch('userType');
  const password_hash = watch('password_hash');

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Log the request for debugging
      console.log('Sending registration request to:', '/api/create');
      console.log('Request payload:', {
        username: data.email,
        email: data.email,
        password: '[HIDDEN]', // Don't log actual password
        user_type: data.userType,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone,
      });

      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.email,
          email: data.email,
          password: data.password_hash,
          user_type: data.userType,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phone,
        }),
        credentials: 'include',
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        // Try to parse error response if exists
        let errorData = { error: 'Unknown server error' };
        try {
          errorData = responseText ? JSON.parse(responseText) : errorData;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        if (response.status === 409) {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid request. Please check your input and try again.');
        } else if (response.status === 429) {
          throw new Error('Too many attempts. Please try again later.');
        } else {
          throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
        }
      }

      // Handle successful response
      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Registration successful:', responseData);

      sessionStorage.setItem('registrationSuccess', 'true');
      navigate('/', {
        state: { 
          fromRegistration: true,
          message: 'Registration successful! Welcome to our platform.' 
        },
        replace: true
      });
      
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'An unexpected error occurred';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Background animation (same as login page)
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
                Join J4All
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Create your account to access personalized resources and connect with your community.
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">Get personalized recommendations based on your needs</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">Access exclusive resources for your user type</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                </div>
                <p className="ml-3 text-gray-600">Connect with others who share similar experiences</p>
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
                    Need help signing up? Contact support at <span className="text-indigo-600">help@j4all.com</span> or call <span className="text-indigo-600">1-800-HELP-NOW</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <h2 id="signup-heading" className="text-2xl font-bold text-gray-800 text-center">
              Create Your Account
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Fill in your details to get started
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

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  className={`block w-full px-3 py-2 border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="John"
                  aria-invalid={!!errors.firstName}
                  aria-describedby="firstName-error"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <motion.p
                    id="firstName-error"
                    className="text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.firstName.message}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={`block w-full px-3 py-2 border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Doe"
                  aria-invalid={!!errors.lastName}
                  aria-describedby="lastName-error"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <motion.p
                    id="lastName-error"
                    className="text-sm text-red-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.lastName.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

            {/* Phone field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="(123) 456-7890"
                  aria-invalid={!!errors.phone}
                  aria-describedby="phone-error"
                  {...register('phone')}
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
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
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="123 Main St"
                  aria-invalid={!!errors.address}
                  aria-describedby="address-error"
                  {...register('address')}
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

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword_hash ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password_hash ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password_hash}
                  aria-describedby="password-error"
                  {...register('password_hash')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword_hash)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword_hash ? 'Hide password' : 'Show password'}
                >
                  {showPassword_hash ? (
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirmPassword-error"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                  {...register('agreeToTerms')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
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

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
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
                'Create Account'
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

export default SignUpPage;