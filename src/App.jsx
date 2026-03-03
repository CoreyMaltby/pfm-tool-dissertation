import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background-main">
        <Navbar />
        <main className="flex-grow pt-16 w-full pb-10 transition-all duration-300">
          <Routes>
            <Route path="/"/>
            <Route path="/dashboard" element={<h1 className="text-2xl font-bold">Dashboard</h1>} />
            <Route path="/learning-hub" element={<h1 className="text-2xl font-bold">Learning Hub</h1>} />
            <Route path="/support" element={<h1 className="text-2xl font-bold">Support</h1>} />
            <Route path="/privacy-security" element={<h1 className="text-2xl font-bold">Privacy & Security</h1>} />
            <Route path="/login" element={<h1 className="text-2xl font-bold">Login</h1>} />
            <Route path="/signup" element={<h1 className="text-2xl font-bold">Sign Up</h1>} />
            <Route path="/profile" element={<h1 className="text-2xl font-bold">Profile</h1>} />
          </Routes>
        </main>
        <Home />
        <Footer />
      </div>
    </Router>
  );
}

export default App;