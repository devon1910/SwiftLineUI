<<<<<<< HEAD
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
                    <li><b>Create, view, and manage</b> your event queues.</li>
                    <li>Receive <b>reminder email notifications</b> before your turn.</li>
                    <li>Get <b>real-time updates</b> on your queue status.</li>
                    <li>Access your <b>queue history</b> and analytics.</li>
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
=======
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import Navigation from "./Navigation";
import Footer from "../Footer";

const routeContext = (pathname) => {
  if (pathname.startsWith("/search")) {
    return { label: "Discover", message: "Find the right line for today." };
  }

  if (pathname.startsWith("/myEvents")) {
    return { label: "Your events", message: "Keep every event moving." };
  }

  if (pathname.startsWith("/myQueue")) {
    return { label: "Your queue", message: "Your place, clearly communicated." };
  }

  if (pathname.includes("/manage")) {
    return { label: "Queue operations", message: "A calm view of the line." };
  }

  if (pathname.includes("/edit") || pathname.startsWith("/newEvent")) {
    return { label: "Event setup", message: "Shape the flow before doors open." };
  }

  if (pathname.startsWith("/events/")) {
    return { label: "Event details", message: "Everything attendees need to know." };
  }

  return { label: "Workspace", message: "The simple way to keep a line moving." };
};

function LandingPage({ mode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email;
  const userNameFromState = location.state?.userName;
  const userName = userNameFromState || localStorage.getItem("userName") || "";
  const email = emailFromState || localStorage.getItem("userEmail") || "";
  const userId = location.state?.userId || localStorage.getItem("userId") || "";
  const isHome = mode === "marketing";
  const currentContext = routeContext(location.pathname);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    const username = urlParams.get("username");
    const queryUserId = urlParams.get("userId");

    if (accessToken) {
      localStorage.setItem("user", JSON.stringify(accessToken));
      localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
      localStorage.setItem("userName", username || "");
      localStorage.setItem("userId", queryUserId || "");
      navigate("/", { replace: true });
    }

    const savedTheme = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme);
    document.documentElement.style.colorScheme = savedTheme ? "dark" : "light";
    setDarkMode(savedTheme);
    setLoaded(true);
  }, [navigate]);

  const toggleDarkMode = () => {
    setDarkMode((currentMode) => {
      const nextMode = !currentMode;
      document.body.classList.toggle("dark-mode", nextMode);
      document.documentElement.classList.toggle("dark", nextMode);
      document.documentElement.style.colorScheme = nextMode ? "dark" : "light";
      localStorage.setItem("darkMode", String(nextMode));
      return nextMode;
    });
  };

  return (
    <div className="app-shell">
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className={`app-main${isHome ? " app-main--home" : ""}`}>
        <div className="app-main__inner">
          {isHome ? (
            <section className="shell-home" aria-labelledby="swiftline-home-title">
              <div className="shell-hero">
                <div className="shell-hero__layout">
                  <div className="shell-hero__copy">
                    <p className="shell-eyebrow">
                      <span className="shell-eyebrow__dot" aria-hidden="true" />
                      Queue operations, made human
                    </p>
                    <h1 id="swiftline-home-title">
                      Move people through <em>their day.</em>
                    </h1>
                    <p className="shell-hero__lede">
                      SwiftLine gives organizers a clear view of every queue and gives
                      attendees the confidence to know what happens next.
                    </p>
                    <div className="shell-hero__actions">
                      <button
                        type="button"
                        className="shell-button shell-button--primary"
                        onClick={() => navigate("/search")}
                      >
                        Find an event
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="shell-button shell-button--quiet"
                        onClick={() => navigate("/newEvent")}
                      >
                        Create an event
                        <CalendarClock size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <p className="shell-hero__greeting" aria-live="polite">
                      {loaded ? "Good to see you, " : "Welcome, "}
                      <strong>{userName || "Guest"}</strong>
                    </p>
                  </div>

                  <aside className="shell-hero__panel" aria-label="SwiftLine queue preview">
                    <div className="shell-panel__header">
                      <div>
                        <p className="shell-panel__eyebrow">A clearer line</p>
                        <h2 className="shell-panel__title">Today's flow</h2>
                      </div>
                      <span className="shell-status">
                        <span className="shell-status__dot" aria-hidden="true" />
                        Ready
                      </span>
                    </div>

                    <div className="shell-queue-list">
                      <div className="shell-queue-row">
                        <span className="shell-queue-row__index">01</span>
                        <div>
                          <p className="shell-queue-row__name">Campus health desk</p>
                          <p className="shell-queue-row__meta">14 people waiting</p>
                        </div>
                        <span className="shell-queue-row__time">18 min</span>
                      </div>
                      <div className="shell-queue-row">
                        <span className="shell-queue-row__index">02</span>
                        <div>
                          <p className="shell-queue-row__name">Community legal clinic</p>
                          <p className="shell-queue-row__meta">6 people waiting</p>
                        </div>
                        <span className="shell-queue-row__time">9 min</span>
                      </div>
                      <div className="shell-queue-row">
                        <span className="shell-queue-row__index">03</span>
                        <div>
                          <p className="shell-queue-row__name">Studio check-in</p>
                          <p className="shell-queue-row__meta">Next up is being served</p>
                        </div>
                        <span className="shell-queue-row__time">Open</span>
                      </div>
                    </div>

                    <div className="shell-hero__panel-footer">
                      <p>
                        <strong>One shared signal</strong>
                        Everyone knows where they stand.
                      </p>
                      <CheckCircle2 size={22} aria-hidden="true" />
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          ) : (
            <div className="shell-route-context" aria-label={`${currentContext.label} context`}>
              <p className="shell-route-context__eyebrow">{currentContext.label}</p>
              <p className="shell-route-context__greeting">
                {currentContext.message} {userName && <strong>{userName}</strong>}
              </p>
            </div>
          )}

          <Outlet context={{ email, userId, userName }} />
        </div>
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
      </main>
      {isHome && <Footer />}
    </div>
  );
}

<<<<<<< HEAD
export default LandingPage;
=======
export default LandingPage;

export const MarketingShell = () => <LandingPage mode="marketing" />;
export const AppShell = () => <LandingPage mode="app" />;
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
