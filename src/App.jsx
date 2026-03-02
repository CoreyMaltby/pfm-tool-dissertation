import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-4 md:pt-20 pt-4 pb-24 md:pb-4">
          <Routes>
            <Route path="/" element={<h1 className="text-2xl font-bold">Home Page</h1>} />
            <Route path="/dashboard" element={<h1 className="text-2xl font-bold">Dashboard</h1>} />
            <Route path="/learning-hub" element={<h1 className="text-2xl font-bold">Learning Hub</h1>} />
            <Route path="/support" element={<h1 className="text-2xl font-bold">Support</h1>} />
            <Route path="/privacy-security" element={<h1 className="text-2xl font-bold">Privacy & Security</h1>} />
            <Route path="/login" element={<h1 className="text-2xl font-bold">Login</h1>} />
            <Route path="/signup" element={<h1 className="text-2xl font-bold">Sign Up</h1>} />
            <Route path="/profile" element={<h1 className="text-2xl font-bold">Profile</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;