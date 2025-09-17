import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useToast } from '../../components/ToastContainer';

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setTokenValid(false);
      return;
    }

    // Verify token validity (you might want to do this on the backend)
    // For now, we'll just check if it exists
    setTokenValid(true);
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const token = searchParams.get('token');
      const response = await axios.post('/api/reset-password', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Password updated successfully!',
          autoHide: true,
          autoHideDelay: 5000
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.data.message || 'Failed to reset password',
          autoHide: true,
          autoHideDelay: 5000
        });
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred while resetting your password';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        autoHide: true,
        autoHideDelay: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculator
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-4"
            ></motion.div>
            <p className="text-gray-600">Verifying your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <FaExclamationTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired. 
              Please request a new password reset link.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/forgot-password')}
              className="w-full py-3 px-4 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Request New Reset Link
            </motion.button>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full py-3 px-4 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="text-sm" />
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4"
            >
              <FaCheck className="h-8 w-8 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Password Updated!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="bg-indigo-600 h-2 rounded-full"
              ></motion.div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              Go to login now
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const passwordStrength = calculatePasswordStrength(password || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
              <FaLock className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600">
              Create a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-10`}
                  placeholder="Enter your new password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {errors.password.message}
                </p>
              )}
              
              {password && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength < 50 ? 'text-red-600' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {[
                      'At least 8 characters',
                      'One uppercase letter',
                      'One lowercase letter',
                      'One number'
                    ].map((req, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          (index === 0 && password.length >= 8) ||
                          (index === 1 && /[A-Z]/.test(password)) ||
                          (index === 2 && /[a-z]/.test(password)) ||
                          (index === 3 && /[0-9]/.test(password)) 
                            ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-xs text-gray-500">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-10`}
                  placeholder="Confirm your new password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {errors.confirmPassword.message}
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <FaCheck className="text-xs" />
                  Passwords match
                </p>
              )}
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                  isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                } transition-all duration-200 flex items-center justify-center gap-2`}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Updating Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-4 w-full py-3 px-4 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="text-sm" />
                Back to Login
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;