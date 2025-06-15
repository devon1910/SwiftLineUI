import React, { useState, useEffect } from "react";
import {
  Calendar,
  CircleUserRound,
  Clock,
  Home,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";
import AuthForm from "../auth/AuthForm";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../services/utils/useTheme";

const Navigation = ({ setShowAuthModal, showAuthModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const isAuthenticated = localStorage.getItem("user");
  const userName = localStorage.getItem("userName");

  const navItems = [
    { label: "Dashboard", path: "", icon: <Home size={18} /> },
    { label: "Search Events", path: "search", icon: <Search size={18} /> },
    { label: "My Events", path: "myEvents", icon: <Calendar size={18} /> },
    { label: "My Queue", path: "myQueue", icon: <Clock size={18} /> },
  ];

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  // Get current path to determine active nav item
  const currentPath = window.location.pathname.split("/")[1] || "dashboard";

  const handleAuthAction = () => {
    const isAUser =
      isAuthenticated &&
      isAuthenticated !== "" &&
      !userName?.includes("Anonymous");

    if (isAUser) {
      // For authenticated users, confirm logout
      const confirmLogout = window.confirm(
        "Are you sure you want to log out? Why would you wanna do that though?!🥲"
      );

      if (confirmLogout) {
        LogOut()
          .then((response) => {
            if (response.data.status) {
              localStorage.clear();
              showToast.success(response.data.message);
              navigate("/", { replace: true });
            } else {
              showToast.error(response.data.message);
            }
          })
          .catch((error) => {
            console.error("Error logging out:", error);
            showToast.error("Logout failed. Please try again."); // Generic error for user
          });
      }
    } else {
      // For unauthenticated/anonymous users, show login modal
      setShowAuthModal("login");
    }
  };

  return (
    <header>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300
          ${scrolled ? "py-2" : "py-4"}
          ${
            darkMode
              ? `bg-gray-950 ${scrolled ? "shadow-lg shadow-gray-900/50" : ""}`
              : `bg-white ${scrolled ? "shadow-lg shadow-gray-100/50" : ""}`
          }
          border-b ${
            darkMode ? "border-gray-800" : "border-gray-200"
          }
          backdrop-blur-xl bg-opacity-80
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
                aria-label="Home"
              >
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-xl shadow-md flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src="/theSwiftlineLogo.png"
                    alt="theswiftline Logo"
                  />
                </div>
                <span className={`
                  text-lg sm:text-xl font-bold tracking-tight
                  ${darkMode ? "text-white" : "text-gray-900"}
                  hidden sm:block
                `}>
                  theswiftline
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      relative flex items-center justify-center
                      px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full
                      text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${
                        isActive
                          ? darkMode
                            ? "bg-sage-700 text-white shadow-sm shadow-sage-700/30 focus:ring-sage-500 focus:ring-offset-gray-900"
                            : "bg-sage-600 text-white shadow-sm shadow-sage-600/30 focus:ring-sage-500 focus:ring-offset-white"
                          : darkMode
                          ? "text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-700 focus:ring-offset-gray-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200 focus:ring-offset-white"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {item.icon}
                      <span className="hidden sm:inline">
                        {item.label}
                      </span>
                    </span>
                    {/* Active indicator */}
                    {isActive && (
                      <span className={`
                        absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full
                        ${darkMode ? "bg-white" : "bg-black"}
                      `} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors duration-200
                  ${
                    darkMode
                      ? "bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-sm shadow-gray-800/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm shadow-gray-100/20"
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${darkMode ? "focus:ring-gray-700 focus:ring-offset-gray-900" : "focus:ring-gray-200 focus:ring-offset-white"}
                `}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </button>

              {/* Profile/Auth Button - Now shows text on small screens */}
              <div className="relative">
                <button
                  onClick={() => handleAuthAction()}
                  className={`flex items-center justify-center gap-1
                    px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full transition-colors duration-200
                    text-xs sm:text-sm font-medium
                    ${
                      darkMode
                        ? "text-gray-200 bg-gray-800 hover:bg-gray-700 shadow-sm shadow-gray-800/20"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm shadow-gray-100/20"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${darkMode ? "focus:ring-gray-700 focus:ring-offset-gray-900" : "focus:ring-gray-200 focus:ring-offset-white"}
                    min-w-[70px] sm:min-w-0 {/* Ensure minimum width for text on small screens */}
                  `}
                >
                  <CircleUserRound size={18} className="flex-shrink-0" /> {/* Slightly smaller icon to fit text */}
                  <span className="flex-grow-0 whitespace-nowrap">
                    {!isAuthenticated || userName?.includes("Anonymous")
                      ? "Login"
                      : "Logout"} {/* Conditional text */}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-up transform transition-all duration-300">
            <AuthForm setShowAuthModal={setShowAuthModal} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;