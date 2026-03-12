/** Main App Component
 * Sets up routing and global layout
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import LearningHub from "./pages/LearningHub";
import ArticleView from "./pages/LearningHubPage";
import ProfileSettings from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivacySecurity from "./pages/PrivacySecurity";
import Support from "./pages/Support"
import DashboardOverview from "./pages/DashboardOverview"

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background-main">
        <Navbar />

        {/* Main content area where different pages will be rendered based on the route */}
        <main className="flex-grow pt-16 w-full transition-all duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/learning-hub" element={<LearningHub />} />
            <Route path="/learning-hub/:id" element={<ArticleView />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy-security" element={<PrivacySecurity />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProfileSettings />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;