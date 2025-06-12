import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Navigation from "../layout/Navigation";
import { useNetworkStatus } from "../../services/utils/NetworkStatus";
import { useTheme } from "../../services/utils/useTheme";
import { saveAuthTokens } from "../../services/utils/authUtils";
import { subscribeToPush } from "../../services/utils/pushNotificationsSetup";
import { GetUserInfo } from "../../services/api/swiftlineService";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const userNameFromState = location.state?.userName;
  const userName = userNameFromState || localStorage.getItem("userName") || "Guest";
  const emailFromState = location.state?.email;
  const email = emailFromState || localStorage.getItem("userEmail") || "";
  const userId = location.state?.userId || localStorage.getItem("userId") || "";
  const from = location.state?.from || localStorage.getItem("from") || null;

  const [loaded, setLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const alreadyCalledRef = useRef(false);

  const { darkMode } = useTheme();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("authCode");

    if (authCode) {
      if (alreadyCalledRef.current) return;
      alreadyCalledRef.current = true;

      GetUserInfo(authCode)
        .then((response) => {
          saveAuthTokens(response);
          if (from) {
            localStorage.removeItem("from");
            window.location.href = from;
          } else {
            navigate("/", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
          // Handle error appropriately, e.g., show a toast notification
        });
    }

    setLoaded(true);
  }, [from, navigate]); // Added dependencies for useEffect

  const showGuestBanner = !(userName || email) || userName.includes("Anonymous") || userName.includes("Guest");
  const hasSubscribed = useRef(false);

  useEffect(() => {
    if (!showGuestBanner && !hasSubscribed.current) {
      subscribeToPush();
      hasSubscribed.current = true;
    }
  }, [showGuestBanner]);

  useNetworkStatus();

  return (
    <div
      className={`min-h-screen pt-20 transition-colors duration-300 ${ // Added pt-20 to push content below fixed navbar
        darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Navigation */}
      <Navigation setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Adjusted padding */}
        {/* Guest Banner - only shown when user is not logged in */}
        {showGuestBanner && (
          <div className={`
            mb-8 p-6 md:p-8 rounded-2xl text-center relative overflow-hidden 
            ${darkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 border border-gray-700 shadow-xl" // Dark gradient, border, sharper shadow
              : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-xl" // Light gradient, border, sharper shadow
            }
          `}>
            {/* Background elements for visual interest */}
            <div className={`absolute inset-0 opacity-50 ${darkMode ? "bg-dots-dark" : "bg-dots-light"}`} aria-hidden="true"></div>
            <div className="relative z-10"> {/* Ensure content is above background dots */}
                <div className="text-base sm:text-lg md:text-xl font-medium mb-4 leading-relaxed"> {/* Larger, more relaxed text */}
                  Create an account or sign in to:
                  <ul className="mt-2 list-disc list-inside text-left mx-auto max-w-sm sm:max-w-md"> {/* Bullet points for clarity */}
                    <li>Receive <b>reminder email notifications</b> before your turn.</li>
                    <li><b>Create, view, and manage</b> your event queues.</li>
                    <li>Access all <b>premium features</b>.</li>
                  </ul>
                </div>
                 <button
                   onClick={() => setShowAuthModal('signup')}
                    className={`
                     relative mt-4 px-8 py-3 rounded-full text-lg font-semibold animate-pulse-custom
                     bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-600/40
                    focus:outline-none focus:ring-4 focus:ring-sage-500 focus:ring-offset-2
                     ${darkMode ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"}
                     transition-all duration-300 ease-in-out transform hover:scale-105 animate-pulse `}>
                 Get Started Today
                  
                 </button>
            </div>
          </div>
        )}
        {/* Welcome Message */}
        <div className="mt-8 mb-12 text-center">
          <p className="text-xl sm:text-2xl md:text-3xl font-light"> {/* Larger, lighter font weight */}
            <span>
              <span className="waving-hand text-3xl sm:text-4xl md:text-5xl inline-block mr-2">👋🏽</span> {/* Larger hand */}
              Hello,{" "}
              <strong className="text-sage-500 font-bold">{userName}!</strong> {/* Bold username */}
            </span>
          </p>
          <p className={`
            text-base sm:text-lg mt-2
            ${darkMode ? "text-gray-400" : "text-gray-600"}
          `}>
            Your streamlined queue experience starts here.
          </p>
        </div>
        <Outlet context={{ email, userId, loaded, userName, setShowAuthModal, showAuthModal }} />
      </main>
    </div>
  );
}

export default LandingPage;