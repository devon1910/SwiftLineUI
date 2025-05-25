import React from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { FastForward } from "lucide-react";
import { showToast } from "../../services/utils/ToastHelper";
const Dashboard = () => {
  const navigate = useNavigate();
  const { loaded, userName } = useOutletContext();

  const isGuest =
    userName === "" || userName === "Anonymous" || userName === "Guest";
  const handleNavigation = (path) => {
    if (isGuest && path === "newEvent") {
      showToast.error("Please create an account to continue.");
      return;
    }
    navigate(`/${path}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <section className="text-center py-6 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <img
            src="/Swiftline_logo.jpeg"
            alt="SwiftLine Logo"
            className="w-28 mx-auto mb-6 rounded shadow-lg"
            style={{ filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))" }}
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
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 m-4">
        <div className=" rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-6 h-6 text-emerald-600 mr-2"
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
              <h2 className="text-xl  font-semibold text-gray-800">
                Create New Event
              </h2>
            </div>
            <p className=" mb-6">
              Manage and monitor your own event queues. Create custom events and
              track attendees.
            </p>
            <button
              onClick={() => handleNavigation("myEvents")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              <span>Go to My Events</span>
              <svg
                className="w-5 h-5 ml-2"
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
        </div>

        <div className="rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-600 mr-2"
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
              <h2 className="text-xl font-semibold text-gray-800">
                Join a Queue
              </h2>
            </div>
            <p className="mb-6">
              Search for active events and join the queue. Get real-time updates
              on wait times.
            </p>
            <button
              onClick={() => handleNavigation("search")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              <span>Search Events</span>
              <svg
                className="w-5 h-5 ml-2"
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
        </div>
        {/* Floating Action Button */}
        <button
          onClick={() => handleNavigation("newEvent")}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Create new event"
        >
          <FiPlus className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
