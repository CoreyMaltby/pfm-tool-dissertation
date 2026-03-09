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

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background-main">
        <Navbar />

        {/* Main content area where different pages will be rendered based on the route */}
        <main className="flex-grow pt-16 w-full transition-all duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<h1 className="text-2xl font-bold p-8">Dashboard</h1>}/>
            <Route path="/learning-hub" element={<LearningHub />} />
            <Route path="/learning-hub/:id" element={<ArticleView />} />
            <Route path="/support" element={<h1 className="text-2xl font-bold p-8">Support</h1>} />
            <Route path="/privacy-security" element={<h1 className="text-2xl font-bold p-8">Privacy & Security</h1>} />
            <Route path="/login" element={<h1 className="text-2xl font-bold p-8">Login</h1>} />
            <Route path="/signup" element={<h1 className="text-2xl font-bold p-8">Sign Up</h1>} />
            <Route path="/profile" element={<ProfileSettings />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;