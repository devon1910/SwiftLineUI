import { useState, useEffect } from "react";
import {
  Navigate,
  Outlet,
  replace,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "../layout/Navigation";
import { FastForward, TrendingUpDown } from "lucide-react";
import { useNetworkStatus } from "../../services/utils/NetworkStatus";
import { useTheme } from "../../services/utils/useTheme";

function LandingPage() {
  //const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location.state if available, otherwise from localStorage
  const emailFromState = location.state?.email;
  const userNameFromState = location.state?.userName;
  const userName = userNameFromState || localStorage.getItem("userName") || "";
  const email = emailFromState || localStorage.getItem("userEmail") || "";
  const userId = location.state?.userId || localStorage.getItem("userId") || "";
  const from = location.state?.from || localStorage.getItem("from") || null;
  const [loaded, setLoaded] = useState(false);

  // Load theme preference from local storage
  const { darkMode, toggleDarkMode } = useTheme();
  const handleToggleTheme = () => {
    toggleDarkMode();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if we have auth data in the URL
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    const username = urlParams.get("username");
    const userId = urlParams.get("userId");

    // If we have the access token, store everything in localStorage
    if (accessToken) {
      localStorage.setItem("user", JSON.stringify(accessToken));
      localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
      localStorage.setItem("userName", username);
      localStorage.setItem("userId", JSON.stringify(userId));

      // // Clean up the URL to remove the tokens
      // navigate('/', { replace: true }); // Redirect to dashboard or home page

      if (from) {
        localStorage.removeItem("from");
        window.location.href = from;
      } else {
        navigate("/", {
          replace: true,
        });
      }

      // Or if you want to stay on the same page but clean the URL:
      // window.history.replaceState({}, document.title, window.location.pathname);

      // You might also want to trigger any auth state updates in your app
      // setIsAuthenticated(true); // If you're using a state for auth
    }
    setLoaded(true);
  }, []);

  useNetworkStatus();
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Navigation */}
      <Navigation darkMode={darkMode} toggleDarkMode={handleToggleTheme} />

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
            <div className="text-center py-12">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight relative">
                <span
                  className={`inline-block transition-all duration-700 ${
                    loaded ? "opacity-100" : "opacity-0 -translate-x-8"
                  }`}
                >
                  Welcome to Swift
                </span>
                <span
                  className={`inline-block transition-all duration-700 delay-300 ${
                    loaded ? "opacity-100" : "opacity-0 translate-y-8"
                  }`}
                >
                  Line
                </span>
                <span
                  className={`text-sage-500 ml-2 inline-block transition-all duration-500 delay-500 ${
                    loaded ? "opacity-100 rotate-0" : "opacity-0 rotate-180"
                  }`}
                >
                  <FastForward className="fast-forward-icon" />
                </span>
              </h1>

              <p
                className={`text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${
                  loaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <span className="inline-block animate-pulse">
                  Bypass the Wait,
                </span>{" "}
                <span className="inline-block">Reclaim Your Day –</span>{" "}
                <span className="inline-block font-semibold">
                  Time Liberation, Guaranteed.
                </span>
              </p>
            </div>
          </motion.div>
        </section>

        {/* Welcome Message */}
        <div className="mb-12 text-center md:text-left">
          <p className="text-lg md:text-xl">
          <span>
            <span className="waving-hand">👋🏽</span> Hello,{" "}
            <strong className="text-sage-500">{userName || "Guest"}</strong>
          </span>
          </p>
          
        </div>
        <Outlet context={{ email, userId }} />
      </main>
    </div>
  );
}

export default LandingPage;
