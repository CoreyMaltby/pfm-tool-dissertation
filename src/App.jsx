// Main App Component
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from "./lib/supabaseClient.js";
import { dataService } from "./services/dataService";

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
import DashboardSavings from "./pages/DashboardSavings.jsx";
import DashboardInsights from "./pages/DashboardInsights.jsx"
import DashboardBudgets from "./pages/DashboardBudgets.jsx";
import DashboardTransactions from "./pages/DashboardTransactions.jsx";
import DashboardNotifications from "./pages/DashboardNotifications.jsx";
import DashboardAccounts from "./pages/DashboardAccounts.jsx";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialised = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'SIGNED_OUT') {
        hasInitialised.current = false;
      }

      if (session && !hasInitialised.current && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        hasInitialised.current = true;

        console.log(`[App] Initializing Logic for user: ${session.user.email} (Event: ${event})`);

        dataService.updateLastLogin(session.user.id);
        dataService.generateWeeklySummary(session.user.id);
        dataService.generateMonthlySummary(session.user.id);
      };

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-main border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background-main">
        <Navbar session={session} />

        {/* Main content area */}
        <main className="flex-grow pt-16 w-full transition-all duration-300">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/learning-hub" element={<LearningHub />} />
            <Route path="/learning-hub/:id" element={<ArticleView />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy-security" element={<PrivacySecurity />} />

            {/* Auth Routes*/}
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes */}
            <Route path="/profile" element={session ? <ProfileSettings session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={session ? <DashboardOverview session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard/savings" element={session ? <DashboardSavings session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard/insights" element={session ? <DashboardInsights session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard/budgets" element={session ? <DashboardBudgets session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard/transactions" element={session ? <DashboardTransactions session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard/notifications" element={session ? <DashboardNotifications session={session} /> : <Navigate to="/login" />} />
            <Route path="/dashboard/accounts" element={session ? <DashboardAccounts session={session} /> : <Navigate to="/login" />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;