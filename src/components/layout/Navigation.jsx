import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, CircleUserRound, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";

const Navigation = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("user");
  const profileRef = useRef(null);

  const navItems = [
    { label: "Dashboard", path: "" },
    { label: "Search Events", path: "search" },
    { label: "My Events", path: "myEvents" },
    { label: "My Queue", path: "myQueue" },
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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Add event listener to close dropdown when clicking outside
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for route changes to close the profile dropdown
  useEffect(() => {
    const handleRouteChange = () => {
      setIsProfileOpen(false);
      setIsOpen(false);
    };

    // Clean up function to prevent memory leaks
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

  // Derive active page from the URL
  const currentPath = window.location.pathname.split("/")[1] || "dashboard";

  const handleAuthAction = () => {
    if (isAuthenticated && isAuthenticated !== "undefined") {
      const confirmAction = window.confirm(
        "Are you sure you want to log out?"
      );

      if (confirmAction) {
        LogOut()
          .then(() => {
            localStorage.clear();
            window.history.replaceState({}, document.title);
            setIsOpen(false);
            setIsProfileOpen(false);
            navigate("/");
          })
          .catch((error) => {
            showToast.error(error.response?.data?.data?.message || "Logout failed");
          });
      }
    } else {
      navigate("/auth");
      setIsProfileOpen(false);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      } ${
        darkMode 
          ? `bg-gray-900 ${scrolled ? "shadow-md shadow-gray-800/20" : ""}` 
          : `bg-white ${scrolled ? "shadow-md shadow-gray-200/60" : ""}`
      } border-b ${darkMode ? "border-gray-800" : "border-gray-100"} backdrop-blur-sm bg-opacity-95`}
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
                        ? "bg-sage-700 text-white"
                        : "bg-sage-600 text-white"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
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
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                  darkMode
                    ? "text-gray-200 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <CircleUserRound size={20} />
                <span className="hidden sm:block text-sm font-medium">
                  {isAuthenticated && isAuthenticated !== "undefined" ? "Account" : "Sign In"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg overflow-hidden shadow-lg py-1 ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-100"
                  }`}
                >
                  {/* {isAuthenticated && isAuthenticated !== "undefined" && (
                    <>
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setIsProfileOpen(false);
                        }}
                        className={`block w-full px-4 py-2 text-sm text-left ${
                          darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        My Profile
                      </button>
                      <div className={darkMode ? "border-t border-gray-700" : "border-t border-gray-100"}></div>
                    </>
                  )} */}
                  <button
                    onClick={handleAuthAction}
                    className={`block w-full px-4 py-2 text-sm text-left ${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isAuthenticated && isAuthenticated !== "undefined" ? "Log Out" : "Log In"}
                  </button>
                </div>
              )}
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
          <div className={`md:hidden mt-4 pb-4 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
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
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;