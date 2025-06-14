import React from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion"; // Ensure framer-motion is installed: npm install framer-motion
import { FastForward } from "lucide-react";
import { showToast } from "../../services/utils/ToastHelper";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme

const Dashboard = () => {
  const navigate = useNavigate();
  const { loaded, userName, setShowAuthModal } = useOutletContext(); // Get setShowAuthModal
  const { darkMode } = useTheme(); // Get dark mode

  const isGuest =
    userName === "" || userName === "Anonymous" || userName.includes("Guest"); // Use .includes for robustness

  const handleNavigation = (path) => {
    if (isGuest && path === "newEvent") {
      showToast.error("Please create an account to create new events.");
      setShowAuthModal('signup'); // Prompt signup if guest tries to create event
      return;
    }
    navigate(`/${path}`);
  };

  return (
    <div className="pt-8 pb-16"> {/* Add top padding to prevent overlap with fixed nav, bottom padding for FAB */}
      <section className="text-center py-6 md:py-16"> {/* Reduced top padding, increased overall section padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8" // Increased space-y for better element separation
        >
          <img
            src="/theSwiftlineLogo.png" 
            alt="theSwiftLine Logo"
            className="w-24 h-24 mx-auto mb-6 rounded-3xl shadow-xl border-2 border-sage-500/20" // Larger, more rounded, prominent shadow & border
            style={{ filter: "drop-shadow(0 0 8px rgba(105, 132, 116, 0.4))" }} // Soft sage glow
          />
          <div className="text-center py-8"> {/* Adjusted padding */}
            <h1 className={`
              text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight relative
              ${darkMode ? "text-white" : "text-gray-900"}
            `}>
              <span
                className={`inline-block transition-all duration-700 ${
                  loaded ? "opacity-100" : "opacity-0 -translate-x-8"
                }`}
              >
                Welcome to theswift
              </span>
              <span
                className={`inline-block transition-all duration-700 delay-300 ${
                  loaded ? "opacity-100" : "opacity-0 translate-y-8"
                }`}
              >
                line
              </span>
              <span
                className={`text-sage-500 ml-3 inline-block transition-all duration-500 delay-500 ${
                  loaded ? "opacity-100 rotate-0" : "opacity-0 rotate-180"
                }`}
              >
                <FastForward className="fast-forward-icon w-10 h-10 md:w-12 md:h-12" /> {/* Larger icon */}
              </span>
            </h1>

            <p
              className={`
                text-lg md:text-xl max-w-3xl mx-auto mt-4
                transition-all duration-1000 delay-700
                ${darkMode ? "text-gray-400" : "text-gray-600"}
                ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
              `}
            >
              <span className="inline-block">Your Time,</span>{" "}
              <span className="inline-block">Your Control.</span>{" "}
              <span className="inline-block font-semibold text-sage-500">
                Join Any Queue, anywhere.
              </span>
            </p>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 pb-8"> {/* Increased gap, added padding */}
        {/* Create New Event Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={`
            rounded-2xl shadow-xl overflow-hidden cursor-pointer
            transform transition-all duration-300 ease-in-out
            hover:scale-[1.02] hover:shadow-2xl
            ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}
            border ${darkMode ? "border-gray-700" : "border-gray-200"}
          `}
          onClick={() => handleNavigation("myEvents")}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className={`
                p-3 rounded-full mr-3
                ${darkMode ? "bg-sage-700 text-white" : "bg-sage-100 text-sage-700"}
              `}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
              </div>
              <h2 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Create New Event
              </h2>
            </div>
            <p className={`mb-6 text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Effortlessly manage and monitor your own event queues. Create custom events and track attendees with ease.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); handleNavigation("myEvents"); }} // Prevent card click from propagating
              className={`
                w-full py-3 px-4 rounded-full font-medium flex items-center justify-center gap-2
                bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-600/30
                focus:outline-none focus:ring-4 focus:ring-sage-500 focus:ring-offset-2
                ${darkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"}
                transition-all duration-300 transform hover:scale-105
              `}
            >
              <span>Go to My Events</span>
              <svg
                className="w-5 h-5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Join a Queue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className={`
            rounded-2xl shadow-xl overflow-hidden cursor-pointer
            transform transition-all duration-300 ease-in-out
            hover:scale-[1.02] hover:shadow-2xl
            ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}
            border ${darkMode ? "border-gray-700" : "border-gray-200"}
          `}
          onClick={() => handleNavigation("search")}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className={`
                p-3 rounded-full mr-3
                ${darkMode ? "bg-sage-700 text-white" : "bg-sage-100 text-sage-700"}
              `}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h2 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                Join a Queue
              </h2>
            </div>
            <p className={`mb-6 text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Discover and join active event queues effortlessly. Receive real-time updates on wait times to plan your day.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); handleNavigation("search"); }} // Prevent card click from propagating
              className={`
                w-full py-3 px-4 rounded-full font-medium flex items-center justify-center gap-2
                bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-600/30
                focus:outline-none focus:ring-4 focus:ring-sage-500 focus:ring-offset-2
                ${darkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"}
                transition-all duration-300 transform hover:scale-105
              `}
            >
              <span>Search Events</span>
              <svg
                className="w-5 h-5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => handleNavigation("newEvent")}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center
          w-16 h-16 md:w-18 md:h-18 // Slightly larger
          bg-sage-600 hover:bg-sage-700 text-white rounded-full
          shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out
          transform hover:scale-110 // More pronounced scale
          group
          focus:outline-none focus:ring-4 focus:ring-sage-500 focus:ring-offset-2
          ${darkMode ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"}
        `}
        aria-label="Create new event"
      >
        <FiPlus className="w-9 h-9 md:w-11 md:h-11 transition-transform group-hover:rotate-90 duration-300" /> {/* Larger icon, faster rotate */}
      </button>
    </div>
  );
};

export default Dashboard;