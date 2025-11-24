import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header'; // Adjust the import path as necessary
import EditEmployerAccountModal from '../pages/profile/EditEmployerAccountModal';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const hideHeaderPages = ['/', '/login', '/SignUpPage', '/EmployerSignUpForm', '/verify-email']; // Add paths where header should be hidden
  const [editEmployerAccountOpen, setEditEmployerAccountOpen] = React.useState(false);

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
      {!shouldHideHeader && <Header onEmployerEditAccount={() => setEditEmployerAccountOpen(true)} />}
      <main className={!shouldHideHeader ? "pt-16" : ""}>
        {children}
      </main>
      <EditEmployerAccountModal
        isOpen={editEmployerAccountOpen}
        onClose={() => setEditEmployerAccountOpen(false)}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default Layout;