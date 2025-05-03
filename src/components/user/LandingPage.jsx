import { useState, useEffect } from "react";
import {
  Navigate,
  Outlet,
  replace,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  const [showAuthModal, setShowAuthModal] = useState(null);

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
      <Navigation darkMode={darkMode} toggleDarkMode={handleToggleTheme} setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        

        {/* Welcome Message */}
        <div className="mb-12 mt-8 text-center md:text-left">
          <p className="text-lg md:text-xl">
          <span>
            <span className="waving-hand">👋🏽</span>,{" "}
            <strong className="text-sage-500">{userName || "Guest"}</strong>
          </span>
          </p>
        </div>
        <Outlet context={{ email, userId, loaded, userName, setShowAuthModal,showAuthModal }} />
      </main>
    </div>
  );
}

export default LandingPage;
