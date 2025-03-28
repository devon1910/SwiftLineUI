import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "./Navigation";
import LoadingSpinner from "../LoadingSpinner";
import { FastForward } from "lucide-react";

function LandingPage() {

  const [events, setEvents] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  
  // Get email from location.state if available, otherwise from localStorage
  const emailFromState = location.state?.email;
  const [email, setEmail] = useState(emailFromState || localStorage.getItem("userEmail") || "");
  const [userId, setUserId] = useState(location.state?.userId || localStorage.getItem("userId") || "");
  
  // Save email to localStorage if it comes from state
  useEffect(() => {
    if (emailFromState) {
      localStorage.setItem("userEmail", emailFromState);
    }
    if (location.state?.userId) {
      localStorage.setItem("userId", location.state.userId);
    }
  }, [emailFromState, location.state]);

  useEffect(() => {
    // Load theme preference from local storage
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Navigation */}
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <img
              src="https://res.cloudinary.com/dddabj5ub/image/upload/v1741908218/swifline_logo_cpsacv.webp"
              alt="SwiftLine Logo"
              className="w-28 mx-auto mb-6"
            />
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome to SwiftLine<span className="text-sage-500 ml-2 fast-forward-icon"><FastForward /></span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Queue Smarter, Not Harder – Your Time, Optimized.
            </p>
          </motion.div>
        </section>

        {/* Welcome Message */}
        <div className="mb-12 text-center md:text-left">
          <p className="text-lg md:text-xl">
            {email ? (
              <span>
              <span className="waving-hand">👋🏽</span> Hello, <strong className="text-sage-500">{email}</strong>
              </span>
            ) : (
              <span>
                <span className="waving-hand">👋🏽</span> Hello, <strong className="text-sage-500">Guest</strong>
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : (
          // Render nested routes here
          <Outlet context={{ events, setEvents, email, userId }} />
        )}
      </main>
    </div>
  );
}

export default LandingPage;
