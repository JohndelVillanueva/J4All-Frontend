import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaAccessibleIcon, FaGlobeAmericas, FaQuestionCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import type { JSX } from 'react';
import { useToast } from '../../components/ToastContainer';
import { handleRegistrationError } from '../../src/utils/errorHandler';

// Type definitions
type UserType = 'general' | 'pwd';

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
  pwdIdNumber?: string; // Add this line
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
  userType: z.enum(['general', 'pwd']),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
  pwdIdNumber: z.string().optional(), // Add this line
}).refine((data) => data.password_hash === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.userType === 'pwd') {
    return !!data.pwdIdNumber && data.pwdIdNumber.trim().length > 0;
  }
  return true;
}, {
  message: 'PWD ID Number is required for PWD users',
  path: ['pwdIdNumber'],
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
    pwd: 'Person with Disability'
  };

  const iconMap: Record<UserType, JSX.Element> = {
    general: <FaUser className="mr-1" />,
    pwd: <FaAccessibleIcon className="mr-1" />
  };

  return (
    <motion.button
      type="button"
      onClick={() => onChange(type)}
      className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-black shadow-md' 
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
  const { showToast } = useToast();
  const [showPassword_hash, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const formRef = useFocusTrap();
  const [step, setStep] = useState(1); // <-- Add step state

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
      let response;
      if (photoFile) {
        // Use FormData if photo is present
        const formData = new FormData();
        formData.append('username', data.email);
        formData.append('email', data.email);
        formData.append('password', data.password_hash);
        formData.append('user_type', data.userType);
        formData.append('first_name', data.firstName);
        formData.append('last_name', data.lastName);
        formData.append('phone_number', data.phone);
        formData.append('address', data.address);
        if (data.userType === 'pwd' && data.pwdIdNumber) {
          formData.append('pwd_id_number', data.pwdIdNumber);
        }
        formData.append('photo', photoFile);
        response = await fetch('/api/create', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
      } else {
        // Fallback to JSON if no photo
        const payload: any = {
          username: data.email,
          email: data.email,
          password: data.password_hash,
          user_type: data.userType,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phone,
          address: data.address,
        };
        if (data.userType === 'pwd' && data.pwdIdNumber) {
          payload.pwd_id_number = data.pwdIdNumber;
        }
        response = await fetch('/api/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
      }

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
        
        // Create a mock error object for the error handler
        const mockError = {
          response: {
            status: response.status,
            data: errorData
          }
        };
        
        const errorInfo = handleRegistrationError(mockError);
        showToast(errorInfo);
        return;
      }

      // Handle successful response
      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Registration successful:', responseData);

      // All user types now require email verification
      showToast({
        type: 'success',
        title: 'Account Created Successfully!',
        message: 'Please check your email to verify your account before logging in.',
        autoHide: true,
        autoHideDelay: 5000
      });

      // Navigate to verification page for all user types
      navigate('/verify-email', {
        state: { 
          fromRegistration: true,
          email: data.email,
          message: 'Please verify your email to activate your account.' 
        },
        replace: true
      });
      
    } catch (err) {
      console.error('Registration error:', err);
      
      const errorInfo = handleRegistrationError(err);
      showToast(errorInfo);
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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Rich background gradient and floating shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200" />
        {/* Floating blurred circles */}
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[32rem] h-[32rem] bg-purple-300 opacity-30 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-[-120px] w-80 h-80 bg-blue-200 opacity-20 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/3 right-1/2 w-72 h-72 bg-pink-200 opacity-20 rounded-full blur-2xl animate-float" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-indigo-200 opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-purple-200 opacity-20 blur-xl"></div>
      
      {/* Landscape layout: flex row for desktop, stack for mobile */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center min-h-screen gap-8">
        {/* Left side - Branding/Info */}
        <div className="w-full md:w-1/2 lg:w-2/5 mb-8 md:mb-0 md:pr-12 relative z-10 flex-shrink-0">
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
            <h1 className="text-4xl font-bold text-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 text-black">
                Join J4IPWDs
              </span>
            </h1>
            <p className="text-xl text-black mb-6">
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
          className="w-full md:w-1/2 lg:w-2/5 max-w-lg rounded-2xl shadow-2xl border border-gray-100 p-8 relative z-10 backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 fixed md:static right-0 top-0 h-screen overflow-auto md:h-auto md:overflow-visible"
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
                    Need help signing up? Contact support at <span className="text-indigo-600">help@j4ipwds.com</span> or call <span className="text-indigo-600">1-800-HELP-NOW</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <h2 id="signup-heading" className="text-2xl font-bold text-gray-800 text-center">
              Create Your Account
            </h2>
            <p className="text-center text-black mb-6">
              Fill in your details to get started
            </p>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <fieldset className="space-y-2 col-span-2">
                  <legend className="block text-sm font-medium text-black mb-2">
                    I am a:
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(['general', 'pwd'] as UserType[]).map((type) => (
                      <UserTypeButton
                        key={type}
                        type={type}
                        currentType={userType}
                        onChange={(t) => setValue('userType', t)}
                      />
                    ))}
                  </div>
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-black">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                  {/* Last Name */}
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-black">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                  {/* Email - full width */}
                  <div className="space-y-2 col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-black">
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
                        className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-black">
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
                        className={`block w-full pl-10 pr-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                  {/* Address */}
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium text-black">
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
                        className={`block w-full pl-10 pr-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                  {/* PWD ID Number (if shown) - full width */}
                  {userType === 'pwd' && (
                    <div className="space-y-2 col-span-2">
                      <label htmlFor="pwdIdNumber" className="block text-sm font-medium text-black">
                        PWD ID Number
                      </label>
                      <input
                        id="pwdIdNumber"
                        type="text"
                        className={`block w-full px-3 py-2 border ${errors.pwdIdNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                        placeholder="Enter your PWD ID Number"
                        aria-invalid={!!errors.pwdIdNumber}
                        aria-describedby="pwdIdNumber-error"
                        {...register('pwdIdNumber')}
                      />
                      {errors.pwdIdNumber && (
                        <motion.p
                          id="pwdIdNumber-error"
                          className="text-sm text-red-600"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.pwdIdNumber.message}
                        </motion.p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button type="button" className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition" onClick={() => setStep(2)}>
                    Next
                  </button>
                </div>
              </>
            )}
            {/* Step 2 */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-black">
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
                        className={`block w-full pl-10 pr-10 py-2 border ${errors.password_hash ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
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
                        className={`block w-full pl-10 pr-10 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
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
                </div>
                {/* Terms and conditions, photo, and submit button remain below, full width */}
                <div className="col-span-2">
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
                      <label htmlFor="agreeToTerms" className="text-black">
                        I agree to the{' '}
                        <a href="#" className="text-indigo-600 hover:text-indigo-800 underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-indigo-600 hover:text-indigo-800 underline">
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
                  {/* Profile Photo Upload */}
                  <div className="mt-4">
                    <label htmlFor="photo" className="block text-sm font-medium text-black">
                      Profile Photo (optional)
                    </label>
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setPhotoFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPhotoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setPhotoPreview(null);
                        }
                      }}
                    />
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Profile Preview"
                        className="mt-2 w-20 h-20 rounded-full object-cover border"
                      />
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <button type="button" className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold shadow hover:bg-gray-400 transition" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                  </div>
                </div>
              </>
            )}
            {/* Always show the sign in link at the bottom */}
            <div className="w-full flex justify-center mt-4">
              <a href="/" className="text-indigo-600 hover:underline text-sm font-medium cursor-pointer">Already have an account? Sign In</a>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;