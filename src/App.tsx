import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PwdPage from "../pages/admin/PwdPage"; // Ensure the file exists at 'src/components/PwdPage.tsx' or adjust the path accordingly
import IndiPeoplePage from "../pages/admin/IndiPeoplePage"; // Ensure the file exists at 'src/components/IndigenousPeoplePage.tsx' or adjust the path accordingly
import Layout from "../layouts/Layout"; // Ensure the file exists at 'src/components/Layout.tsx' or adjust the path accordingly
import Login from "../pages/login"; // Ensure the file exists at 'src/components/Login.tsx' or adjust the path accordingly
import AdminDashboard from "../routing/admin/AdminDashboard";
import IndigenousDashboard from "../routing/indigenous/IndigenousDashboard";
export default function App() {
  return (
    <div className="App">
      {/* Main content area */}
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/IndigenousDashboard" element={<IndigenousDashboard />} />
            <Route path="/pwd" element={<PwdPage />} />
            <Route path="/indigenous-people" element={<IndiPeoplePage />} />
          </Routes>
        </Layout>
        {/* Footer */}
      </Router>
    </div>
  );
}
