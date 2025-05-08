import { useState, useEffect } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navigation from "../layout/Navigation";
import { FastForward, TrendingUpDown } from "lucide-react";
import { useNetworkStatus } from "../../services/utils/NetworkStatus";
import { useTheme } from "../../services/utils/useTheme";
import { saveAuthTokens } from "../../services/utils/authUtils";

function LandingPage() {
  //const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location.state if available, otherwise from localStorage
  const emailFromState = location.state?.email;
  const userNameFromState = location.state?.userName;
  const userName = userNameFromState || localStorage.getItem("userName") || "Guest";
  const email = emailFromState || localStorage.getItem("userEmail") || "";
  const userId = location.state?.userId || localStorage.getItem("userId") || "";
  const from = location.state?.from || localStorage.getItem("from") || null;
  const [loaded, setLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(null);

  // Load theme preference from local storage
  const { darkMode } = useTheme();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if we have auth data in the URL
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    const username = urlParams.get("username");
    const userId = urlParams.get("userId");

    // If we have the access token, store everything in localStorage
    if (accessToken) {
      saveAuthTokens({ accessToken, refreshToken, username, userId });

      if (from) {
        localStorage.removeItem("from");
        window.location.href = from;
      } else {
        navigate("/", {
          replace: true,
        });
      }
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
      <Navigation setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        
        {/* Guest Banner - only shown when user is not logged in */}
        {!(userName || email) || userName.includes("Anonymous") || userName.includes("Guest") && (
          <div className={`mb-4 p-3 rounded-md text-center ${
            darkMode 
              ? "bg-gray-800 text-gray-300 border border-gray-700" 
              : "bg-gray-100 text-gray-700 border border-gray-200"
          }`}>
            <p className="text-sm md:text-base flex flex-wrap items-center justify-center gap-2">
              Create an account or sign in to create, view, manage your event queues and access more features.
              <button 
                onClick={() => setShowAuthModal('signup')}
                className={`mr-5 underline animate-pulse ${
                  darkMode ? "text-sage-400" : "text-sage-600"
                } font-medium`}
              >
                Get started
              </button>
            </p>
          </div>
        )}
        {/* Welcome Message */}
        <div className="mb-12 mt-8 text-center md:text-left">
          <p className="text-lg md:text-xl">
          <span>
            <span className="waving-hand">👋🏽</span>,{" "}
            <strong className="text-sage-500">{userName}</strong>
          </span>
          </p>
        </div>
        <Outlet context={{ email, userId, loaded, userName, setShowAuthModal,showAuthModal }} />
      </main>
    </div>
  );
}

export default LandingPage;
