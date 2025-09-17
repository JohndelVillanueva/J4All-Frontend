import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaArrowLeft, FaPaperPlane, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastContainer';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post("/api/forgot-password", { email });
      setSubmitted(true);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'If an account with that email exists, a reset link has been sent.',
        autoHide: true,
        autoHideDelay: 5000
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to send reset email. Please try again.',
        autoHide: true,
        autoHideDelay: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FaLock className="text-indigo-600 text-xl" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            {submitted 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive a reset link"
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <p className="text-green-700 mb-6 font-medium">
                If an account with that email exists, we've sent a reset link.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="text-sm" />
                Back to Login
              </motion.button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="text-sm" />
                )}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full text-gray-600 py-3 rounded-lg font-medium hover:text-indigo-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="text-sm" />
                Back to Login
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;