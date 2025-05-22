import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../layouts/Layout";
import Login from "../pages/auth/Login";
import SignUpPage from "../pages/auth/SignUp";
import EmployerSignUpForm from "../pages/auth/EmployerSignUp";
import { AuthProvider } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen"; // Create this component

// Lazy-loaded components
const PwdPage = lazy(() => import("../pages/admin/PwdPage"));
const IndiPeoplePage = lazy(() => import("../pages/admin/IndiPeoplePage"));
const PWDDashboard = lazy(() => import("../pages/pwd/WelcomePage"));
const IndigenousDashboard = lazy(
  () => import("../routing/indigenous/IndigenousDashboard")
);
const AdminDashboard = lazy(() => import("../routing/admin/AdminDashboard"));

export default function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/SignUpPage" element={<SignUpPage />} />
              <Route path="/EmployerSignUpForm" element={<EmployerSignUpForm />} />

              {/* Lazy-loaded routes with Suspense */}
              <Route
                path="/IndigenousDashboard"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <IndigenousDashboard />
                  </Suspense>
                }
              />
              <Route
                path="/PWDDashboard"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <PWDDashboard />
                  </Suspense>
                }
              />
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
                path="/AdminDashboard"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminDashboard />
                  </Suspense>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </div>
    </AuthProvider>
  );
}
