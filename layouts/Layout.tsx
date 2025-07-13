import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header'; // Adjust the import path as necessary

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const hideHeaderPages = ['/', '/SignUpPage', '/EmployerSignUpForm']; // Add paths where header should be hidden

  const shouldHideHeader = hideHeaderPages.includes(location.pathname) || !user;

  // Show loading spinner while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!shouldHideHeader && <Header />}
      <main className={!shouldHideHeader ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  );
};

export default Layout;