import { ErrorType } from '../../components/ErrorMessage';

export interface ApiError {
  success: false;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
  details?: string;
}

export interface ErrorInfo {
  type: ErrorType;
  title?: string;
  message: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const handleApiError = (error: any): ErrorInfo => {
  console.error('API Error:', error);

  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      type: 'error',
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      autoHide: false
    };
  }

  // Response errors
  if (error.response) {
    const { status, data } = error.response;
    const apiError = data as ApiError;

    switch (status) {
      case 400:
        return handleValidationError(apiError);
      case 401:
        return {
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in to continue.',
          autoHide: true,
          autoHideDelay: 3000
        };
      case 403:
        return {
          type: 'error',
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          autoHide: true,
          autoHideDelay: 4000
        };
      case 404:
        return {
          type: 'error',
          title: 'Not Found',
          message: 'The requested resource was not found.',
          autoHide: true,
          autoHideDelay: 3000
        };
      case 409:
        return handleConflictError(apiError);
      case 422:
        return handleValidationError(apiError);
      case 429:
        return {
          type: 'warning',
          title: 'Too Many Requests',
          message: 'You have made too many requests. Please wait a moment and try again.',
          autoHide: true,
          autoHideDelay: 5000
        };
      case 500:
        return {
          type: 'error',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          autoHide: true,
          autoHideDelay: 5000
        };
      default:
        return {
          type: 'error',
          title: 'Request Failed',
          message: apiError?.message || apiError?.error || `Request failed with status ${status}`,
          autoHide: true,
          autoHideDelay: 4000
        };
    }
  }

  // Generic error
  return {
    type: 'error',
    title: 'Unexpected Error',
    message: error?.message || 'An unexpected error occurred. Please try again.',
    autoHide: true,
    autoHideDelay: 4000
  };
};

const handleValidationError = (apiError: ApiError): ErrorInfo => {
  if (apiError.errors) {
    const errorMessages = Object.entries(apiError.errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    
    return {
      type: 'warning',
      title: 'Validation Error',
      message: errorMessages,
      autoHide: false
    };
  }

  return {
    type: 'warning',
    title: 'Invalid Input',
    message: apiError.message || apiError.error || 'Please check your input and try again.',
    autoHide: false
  };
};

const handleConflictError = (apiError: ApiError): ErrorInfo => {
  const message = apiError.message || apiError.error || '';
  
  // Handle specific conflict cases
  if (message.toLowerCase().includes('email')) {
    return {
      type: 'error',
      title: 'Email Already Exists',
      message: 'This email address is already registered. Please use a different email or try logging in.',
      autoHide: false
    };
  }
  
  if (message.toLowerCase().includes('username')) {
    return {
      type: 'error',
      title: 'Username Already Taken',
      message: 'This username is already in use. Please choose a different username.',
      autoHide: false
    };
  }

  if (message.toLowerCase().includes('already applied')) {
    return {
      type: 'warning',
      title: 'Already Applied',
      message: 'You have already applied to this job position.',
      autoHide: true,
      autoHideDelay: 4000
    };
  }

  return {
    type: 'error',
    title: 'Conflict',
    message: message || 'This action conflicts with existing data.',
    autoHide: false
  };
};

// Specific error handlers for common scenarios
export const handleRegistrationError = (error: any): ErrorInfo => {
  const baseError = handleApiError(error);
  
  // Override specific registration errors
  if (baseError.message.includes('Email Already Exists')) {
    return {
      type: 'error',
      title: 'Registration Failed',
      message: 'This email address is already registered. Please use a different email or try logging in.',
      autoHide: false
    };
  }

  if (baseError.message.includes('Username Already Taken')) {
    return {
      type: 'error',
      title: 'Registration Failed',
      message: 'This username is already taken. Please choose a different username.',
      autoHide: false
    };
  }

  if (baseError.message.includes('Password too weak')) {
    return {
      type: 'warning',
      title: 'Weak Password',
      message: 'Please choose a stronger password that includes uppercase, lowercase, numbers, and special characters.',
      autoHide: false
    };
  }

  return baseError;
};

export const handleLoginError = (error: any): ErrorInfo => {
  const baseError = handleApiError(error);
  
  if (baseError.message.includes('Invalid email or password')) {
    return {
      type: 'error',
      title: 'Login Failed',
      message: 'Invalid email or password. Please check your credentials and try again.',
      autoHide: false
    };
  }

  if (baseError.message.includes('Account not verified')) {
    return {
      type: 'warning',
      title: 'Account Not Verified',
      message: 'Please check your email and verify your account before logging in.',
      autoHide: false
    };
  }

  return baseError;
};

export const handleJobApplicationError = (error: any): ErrorInfo => {
  const baseError = handleApiError(error);
  
  if (baseError.message.includes('already applied')) {
    return {
      type: 'warning',
      title: 'Already Applied',
      message: 'You have already applied to this job position.',
      autoHide: true,
      autoHideDelay: 4000
    };
  }

  return baseError;
}; 