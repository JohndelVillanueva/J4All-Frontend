import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../layouts/Layout";
import Login from "../pages/auth/Login";
// import SignUpPage from "../pages/auth/SignUp";
import SignUpPage from "../pages/auth/Signup";
import EmployerSignUpForm from "../pages/auth/EmployerSignUp";
import EmailVerification from "../pages/auth/EmailVerification";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../components/ToastContainer";
import LoadingScreen from "../components/LoadingScreen"; // Create this component
import Settings from "../pages/settings/Settings";
import ForgotPassword from "../pages/auth/ForgotPasswordPage"; // Import the new ForgotPassword component
import ResetPasswordPage from "../pages/auth/ResetPasswordPage"; // <-- Add this import
// import ApplicationDetailsPage from '../pages/applicant/ApplicationDetails';

// Lazy-loaded components
const ApplicantDashboard = lazy(
  () => import("../routing/applicant/ApplicantDashboard")
);
const AdminDashboard = lazy(() => import("../routing/admin/AdminDashboard"));
const EmployerDashboard = lazy(() => import("../routing/employer/EmployerDashboard"));
const StatisticsPage = lazy(() => import("../pages/admin/StatisticsPage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));


export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="App">
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/SignUpPage" element={<SignUpPage />} />
                <Route path="/EmployerSignUpForm" element={<EmployerSignUpForm />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* <-- Add this route */}

                {/* Lazy-loaded routes with Suspense */}
                <Route
                  path="/ApplicantDashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ApplicantDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/EmployerDashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <EmployerDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/AdminDashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <AdminDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/statistics"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <StatisticsPage />
                    </Suspense>
                  }
                />
                {/* <Route path="/applications/:id" element={<ApplicationDetailsPage />} /> */}

                {/* Catch-all route - redirect to login */}
                <Route path="*" element={<Login />} />
              </Routes>
            </Layout>
                  </Router>
      </div>
    </ToastProvider>
  </AuthProvider>
);
}
