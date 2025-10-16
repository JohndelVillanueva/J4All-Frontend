import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaAccessibleIcon, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
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
  pwdIdNumber?: string;
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
  pwdIdNumber: z.string().optional(),
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
      className={`flex items-center justify-center py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userType: 'general',
      agreeToTerms: true,
    },
    mode: 'onChange',
  });

  const userType = watch('userType');

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let response;
      if (photoFile) {
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
        let errorData = { error: 'Unknown server error' };
        try {
          errorData = responseText ? JSON.parse(responseText) : errorData;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
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

      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log('Registration successful:', responseData);

      showToast({
        type: 'success',
        title: 'Account Created Successfully!',
        message: 'Please check your email to verify your account before logging in.',
        autoHide: true,
        autoHideDelay: 5000
      });

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

  // Background animation
  const [, setMousePosition] = useState({ x: 0, y: 0 });
  
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

      {/* Main content */}
      <div className="container mx-auto px-2 py-8 flex flex-col md:flex-row items-center justify-center min-h-screen relative z-10">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 lg:w-2/5 mb-8 md:mb-0 md:pr-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500 rounded-xl text-white">
              <FaAccessibleIcon className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 text-black">
              Join J4PWDs
            </h1>
          </div>

          <h2 className="text-xl font-semibold text-black mb-3">
            Create your account to access personalized resources
          </h2>

          <p className="text-black mb-6 leading-relaxed text-sm">
            Connect with talented professionals from diverse backgrounds. Our platform helps you find the right opportunities while promoting workplace inclusivity.
          </p>

          <div className="space-y-1"> 
            {[
              "Personalized recommendations based on your needs",
              "Access exclusive resources for your user type",
              "Connect with others who share similar experiences",
              "Streamlined application process",
              "Dedicated user support",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>
                </div>
                <p className="text-black text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full md:w-2/5 lg:w-1/3 max-w-md z-10"
        >
          <div className="rounded-2xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden backdrop-blur-xl bg-white/30 dark:bg-gray-900/60" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}>
            {/* Decorative element */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100 rounded-full filter blur-3xl opacity-20" />
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'} text-xs`}>
                    {step > 1 ? <FaUser className="text-xs" /> : '1'}
                  </div>
                  <span className="text-xs mt-1">Personal</span>
                </div>
                <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'} text-xs`}>
                    2
                  </div>
                  <span className="text-xs mt-1">Account</span>
                </div>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-black mb-1">Create Your Account</h2>
                <p className="text-black text-sm">Fill in your details to get started</p>
              </div>

              {/* Form error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2 mb-3">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </motion.div>
              )}

              {/* Step Content with Animation */}
              <div className="min-h-[400px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="space-y-3">
                        <h3 className="text-xs font-medium text-black border-b pb-1">Personal Information</h3>
                        
                        <fieldset className="space-y-2">
                          <legend className="block text-xs font-medium text-black mb-2">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* First Name */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">First Name</label>
                            <input
                              type="text"
                              autoComplete="given-name"
                              className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                              placeholder="John"
                              aria-invalid={!!errors.firstName}
                              {...register('firstName')}
                            />
                            {errors.firstName && (
                              <p className="text-xs text-red-500">{errors.firstName.message}</p>
                            )}
                          </div>

                          {/* Last Name */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">Last Name</label>
                            <input
                              type="text"
                              autoComplete="family-name"
                              className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                              placeholder="Doe"
                              aria-invalid={!!errors.lastName}
                              {...register('lastName')}
                            />
                            {errors.lastName && (
                              <p className="text-xs text-red-500">{errors.lastName.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-black">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <FaEnvelope className="w-3 h-3" />
                            </div>
                            <input
                              type="email"
                              autoComplete="email"
                              className={`block w-full pl-9 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                              placeholder="your@email.com"
                              aria-invalid={!!errors.email}
                              {...register('email')}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Phone Number */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">Phone Number</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaPhone className="w-3 h-3" />
                              </div>
                              <div className="absolute inset-y-0 left-0 pl-9 flex items-center pointer-events-none text-gray-700 font-medium text-sm">
                                +63
                              </div>
                              <input
                                type="tel"
                                autoComplete="tel"
                                maxLength={10}
                                className={`block w-full pl-[4.5rem] pr-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                                placeholder="9123456789"
                                aria-invalid={!!errors.phone}
                                {...register('phone', {
                                  onChange: (e) => {
                                    let value = e.target.value;
                                    // Remove any non-digit characters
                                    value = value.replace(/[^\d]/g, '');
                                    // Ensure it doesn't start with +63 (we show it as prefix)
                                    if (value.startsWith('+63')) {
                                      value = value.substring(3);
                                    }
                                    if (value.startsWith('63')) {
                                      value = value.substring(2);
                                    }
                                    // Limit to 10 digits
                                    if (value.length > 10) {
                                      value = value.substring(0, 10);
                                    }
                                    e.target.value = value;
                                  }
                                })}
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-xs text-red-500">{errors.phone.message}</p>
                            )}
                          </div>

                          {/* Address */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">Address</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaMapMarkerAlt className="w-3 h-3" />
                              </div>
                              <input
                                type="text"
                                autoComplete="street-address"
                                className={`block w-full pl-9 pr-3 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                                placeholder="123 Main St"
                                aria-invalid={!!errors.address}
                                {...register('address')}
                              />
                            </div>
                            {errors.address && (
                              <p className="text-xs text-red-500">{errors.address.message}</p>
                            )}
                          </div>
                        </div>

                        {/* PWD ID Number */}
                        {userType === 'pwd' && (
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">PWD ID Number</label>
                            <input
                              type="text"
                              className={`block w-full px-3 py-2 border ${errors.pwdIdNumber ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                              placeholder="Enter your PWD ID Number"
                              aria-invalid={!!errors.pwdIdNumber}
                              {...register('pwdIdNumber')}
                            />
                            {errors.pwdIdNumber && (
                              <p className="text-xs text-red-500">{errors.pwdIdNumber.message}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-3">
                        <motion.button 
                          type="button" 
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition text-sm"
                          onClick={async () => {
                            const fieldsToValidate = userType === 'pwd' 
                              ? ['firstName', 'lastName', 'email', 'phone', 'address', 'pwdIdNumber']
                              : ['firstName', 'lastName', 'email', 'phone', 'address'];
                            
                            const isValid = await trigger(fieldsToValidate as any);
                            if (isValid) {
                              setStep(2);
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Next
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Account Information */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="space-y-3">
                        <h3 className="text-xs font-medium text-black border-b pb-1">Account Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Password */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">Password</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaLock className="w-3 h-3" />
                              </div>
                              <input
                                type={showPassword_hash ? 'text' : 'password'}
                                autoComplete="new-password"
                                className={`block w-full pl-9 pr-9 py-2 border ${errors.password_hash ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                                placeholder="••••••••"
                                aria-invalid={!!errors.password_hash}
                                {...register('password_hash')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword_hash)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                aria-label={showPassword_hash ? 'Hide password' : 'Show password'}
                              >
                                {showPassword_hash ? (
                                  <FaEyeSlash className="w-3 h-3" />
                                ) : (
                                  <FaEye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {errors.password_hash && (
                              <p className="text-xs text-red-500">{errors.password_hash.message}</p>
                            )}
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-black">Confirm Password</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaLock className="w-3 h-3" />
                              </div>
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                className={`block w-full pl-9 pr-9 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm`}
                                placeholder="••••••••"
                                aria-invalid={!!errors.confirmPassword}
                                {...register('confirmPassword')}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                              >
                                {showConfirmPassword ? (
                                  <FaEyeSlash className="w-3 h-3" />
                                ) : (
                                  <FaEye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-black">Profile Photo (optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-3 file:border file:rounded-lg file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
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
                            <div className="mt-2 flex justify-center">
                              <img
                                src={photoPreview}
                                alt="Profile Preview"
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                              />
                            </div>
                          )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="space-y-2">
                          <label className="flex items-start space-x-2">
                            <div className="flex items-center h-4">
                              <input
                                type="checkbox"
                                className="h-3 w-3 text-indigo-600 focus:ring-indigo-200 border-gray-300 rounded"
                                {...register('agreeToTerms')}
                              />
                            </div>
                            <span className="text-xs text-black">I agree to the{" "}
                              <a href="#" className="text-indigo-600 hover:underline">Terms and Conditions</a>{" "}
                              and{" "}
                              <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                            </span>
                          </label>
                          {errors.agreeToTerms && (
                            <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-3">
                        <motion.button 
                          type="button" 
                          className="px-4 py-1.5 rounded-lg bg-gray-300 text-gray-800 font-semibold shadow hover:bg-gray-400 transition text-sm"
                          onClick={() => setStep(1)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Back
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          className={`px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition text-sm ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                          whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                          whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                        >
                          {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Login link */}
            <div className="mt-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>
              <motion.div
                className="mt-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-2 px-3 border border-gray-200 rounded-lg bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
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
};

export default SignUpPage;