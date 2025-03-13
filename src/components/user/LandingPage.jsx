import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiPlus } from "react-icons/fi";
import Navigation from "./Navigation";
import Dashboard from "./Dashboard";
import SearchEvents from "./SearchEvents";
import MyEvents from "./MyEvents";
import EventForm from "./EventForm";
import MyQueue from "./MyQueue";
import ViewQueue from "./ViewQueue";
import { eventsList } from "../../services/swiftlineService";
import LoadingSpinner from "../LoadingSpinner";
import {
  Container,
  WelcomeMessage,
  ContentWrapper,
  HeroSection,
  ToggleButton,
  FloatingActionButton,
} from "../../services/StyledComponents";
import { CustomCursor } from "../CustomCursor";
import ParticlesBackground from "../ParticlesComponent";
import { Header } from "../Header";
import { Footer } from "../Footer";

function LandingPage() {
  const location = useLocation();
  const { userId, email } = location.state || {};
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    getEventsList();
    // Load theme preference from local storage
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  function getEventsList() {
    eventsList()
      .then((response) => {
        setEvents(response.data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        console.error("Error fetching events:", error);
      });
  }

  const handlePageChange = (page, event = null) => {
    event ? setEditingEvent(event) : setEditingEvent(null);
    setCurrentPage(page);
  };

  const handleSkip = (userId) => {
    console.log(`Skipping user with ID: ${userId}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Navigation */}
      <Navigation 
      onPageChange={handlePageChange} 
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode} // Add this prop
    />

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
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome to SwiftLine
              <span className="text-sage-500 ml-2">⚡</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Queue Smarter, Not Harder – Your Time, Optimized.
            </p>
          </motion.div>
        </section>

        {/* Welcome Message */}
        <div className="mb-12 text-center md:text-left">
          <p className="text-lg md:text-xl">
            👋 Hello, <strong className="text-sage-500">{email}</strong>
          </p>
        </div>

        {/* Content Area */}
        <div className="pb-16">
          {currentPage === "dashboard" && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <Dashboard onPageChange={handlePageChange} />
            </motion.div>
          )}

          {currentPage === "search" && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <SearchEvents
                events={events}
                onPageChange={handlePageChange}
                userId={userId}
              />
            </motion.div>
          )}
          {currentPage === "myevents" && (
            <motion.div
              initial={{ x: 25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <MyEvents
                events={events.filter((event) => event.createdBy === email)}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}
          {currentPage === "eventForm" && (
            <EventForm
              onPageChange={handlePageChange}
              events={events}
              setEvents={setEvents}
              editingEvent={editingEvent}
            />
          )}
          {currentPage === "myqueue" && <MyQueue />}
          {currentPage === "queueManagement" && (
            <ViewQueue event={editingEvent} onSkip={handleSkip} />
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => handlePageChange("eventForm")}
        className="fixed bottom-8 right-8 bg-sage-500 text-white p-4 rounded-full shadow-lg hover:bg-sage-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
      >
        <FiPlus size={28} />
      </button>
    </div>
  );
}

export default LandingPage;
