import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header'; // Adjust the import path as necessary

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideHeaderPages = ['/', '/SignUpPage']; // Add paths where header should be hidden
  const shouldHideHeader = hideHeaderPages.includes(location.pathname);

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