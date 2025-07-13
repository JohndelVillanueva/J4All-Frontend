import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useToast } from '../../components/ToastContainer';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const location = useLocation();

  const token = searchParams.get('token');

  // Get email from navigation state or URL params
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus('success');
        showToast({
          type: 'success',
          title: 'Email Verified!',
          message: 'Your account has been verified successfully. You can now log in.',
          autoHide: true,
          autoHideDelay: 5000
        });
      } else {
        setVerificationStatus('error');
        setErrorMessage(data.message || data.error || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!email.trim()) {
      showToast({
        type: 'error',
        title: 'Email Required',
        message: 'Please enter your email address to resend the verification email.',
        autoHide: true,
        autoHideDelay: 4000
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast({
          type: 'success',
          title: 'Verification Email Sent',
          message: 'A new verification email has been sent to your inbox.',
          autoHide: true,
          autoHideDelay: 5000
        });
      } else {
        showToast({
          type: 'error',
          title: 'Failed to Send Email',
          message: data.message || data.error || 'Failed to resend verification email.',
          autoHide: true,
          autoHideDelay: 4000
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to send verification email. Please try again.',
        autoHide: true,
        autoHideDelay: 4000
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  const handleResendWithEmail = () => {
    setVerificationStatus('pending');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FaEnvelope className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isVerifying && (
            <div className="text-center">
              <FaSpinner className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Verifying your email...
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Email Verified Successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Your account has been verified. You can now log in to access your dashboard.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Verification Failed
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {errorMessage}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendWithEmail}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {verificationStatus === 'pending' && !isVerifying && !token && (
            <div className="text-center">
              <FaEnvelope className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Verify Your Email
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address to receive a verification link.
              </p>
              
              <div className="mt-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Email'
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 