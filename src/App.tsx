import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../layouts/Layout";
import Login from "../pages/auth/Login";
import SignUpPage from "../pages/auth/SignUp";
import EmployerSignUpForm from "../pages/auth/EmployerSignUp";
import EmailVerification from "../pages/auth/EmailVerification";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../components/ToastContainer";
import LoadingScreen from "../components/LoadingScreen"; // Create this component
import EditAccount from "../pages/profile/EditAccount";
// import ApplicationDetailsPage from '../pages/applicant/ApplicationDetails';

// Lazy-loaded components
const PwdPage = lazy(() => import("../pages/admin/PwdPage"));
const IndiPeoplePage = lazy(() => import("../pages/admin/IndiPeoplePage"));
const ApplicantDashboard = lazy(
  () => import("../routing/applicant/ApplicantDashboard")
);
const AdminDashboard = lazy(() => import("../routing/admin/AdminDashboard"));
const EmployerDashboard = lazy(() => import("../routing/employer/EmployerDashboard"));

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="App">
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/SignUpPage" element={<SignUpPage />} />
                <Route path="/EmployerSignUpForm" element={<EmployerSignUpForm />} />
                <Route path="/verify-email" element={<EmailVerification />} />

                {/* Lazy-loaded routes with Suspense */}
                <Route
                  path="/ApplicantDashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ApplicantDashboard />
                    </Suspense>
                  }
                />
                {/* <Route
                  path="/PWDDashboard"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <PWDDashboard />
                    </Suspense>
                  }
                /> */}
                <Route
                  path="/indigenous-people"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <IndiPeoplePage />
                    </Suspense>
                  }
                />
                <Route
                  path="/Pwd"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <PwdPage />
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
                {/* <Route path="/applications/:id" element={<ApplicationDetailsPage />} /> */}

                {/* Add EditAccount route here */}
                <Route path="/profile/edit" element={<EditAccount />} />
                
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
