import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  CircleUserRound,
  Clock,
  Home,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";
import Login from "../auth/Login";
import SignUp from "../auth/SignUp";
import AuthForm from "../auth/AuthForm";
import { set } from "date-fns";
import { FiMoon, FiSun } from "react-icons/fi";

const Navigation = ({
  darkMode,
  toggleDarkMode,
  setShowAuthModal,
  showAuthModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
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

  // Handle click outside to close profile dropdown
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     console.log("clicked outside", event);
  //     if (profileRef.current && !profileRef.current.contains(event.target)) {
  //       setShowAuthModal(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // Listen for route changes to close the profile dropdown
  useEffect(() => {
    const handleRouteChange = () => {
      setIsProfileOpen(false);
      setIsOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const currentPath = window.location.pathname.split("/")[1] || "dashboard";

  const handleAuthAction = () => {
    if (
      isAuthenticated !== null &&
      isAuthenticated !== "" &&
      userName !== "Anonymous"
    ) {
      const confirmLogout = window.confirm(
        "Are you sure you want to log out? Why would you wanna do that though?!🥲"
      );
      if (confirmLogout) {
        LogOut()
          .then((response) => {
            if (response.data.status) {
              localStorage.removeItem("user");
              localStorage.removeItem("userName");
              localStorage.removeItem("userId");
              localStorage.removeItem("refreshToken");
              showToast.success(response.data.message);
              navigate("/", { replace: true });
            } else {
              showToast.error(response.data.message);
            }
          })
          .catch((error) => {
            console.error("Error logging out:", error);
          });
      }
    } else {
      setShowAuthModal("login");
    }
    //setShowAuthModal(action); // Show login or sign-up modal
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        } ${
          darkMode
            ? `bg-gray-900 ${scrolled ? "shadow-md shadow-gray-800/20" : ""}`
            : `bg-white ${scrolled ? "shadow-md shadow-gray-200/60" : ""}`
        } border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        } backdrop-blur-sm bg-opacity-95`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="relative w-8 h-8 overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover"
                    src="https://res.cloudinary.com/dddabj5ub/image/upload/v1741908218/swifline_logo_cpsacv.webp"
                    alt="Swiftline"
                  />
                </div>
                <span
                  className={`text-lg font-semibold text-white hidden sm:block`}
                >
                  SwiftLine
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? darkMode
                          ? "bg-sage-700 text-white ring-2 ring-sage-500"
                          : "bg-sage-600 text-white ring-2 ring-black"
                        : darkMode
                        ? "text-white-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="flex items-center gap-1">
                      {item.icon} {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                 <FiSun className="w-5 h-5"/>
                ) : (
                  <FiMoon className="w-5 h-5"/>
                )}
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => handleAuthAction()}
                  className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                    darkMode
                      ? "text-gray-200 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CircleUserRound size={20} />
                  <span className="hidden sm:block text-sm font-medium">
                    {!isAuthenticated || userName === "Anonymous"
                      ? "Login"
                      : "Log out"}
                  </span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden p-2 rounded-full ${
                  darkMode
                    ? "text-gray-200 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div
              className={`md:hidden mt-4 pb-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`px-4 py-3 rounded-lg text-left text-sm font-medium ${
                        isActive
                          ? darkMode
                            ? "bg-sage-700 text-white"
                            : "bg-sage-600 text-white"
                          : darkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {item.icon} {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={(e) => {
            // Close modal only if clicking on the backdrop
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md relative">
            <AuthForm setShowAuthModal={setShowAuthModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
