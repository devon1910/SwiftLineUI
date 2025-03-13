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
import {    Container, 
     WelcomeMessage, 
     ContentWrapper, 
     HeroSection, 
     ToggleButton, 
     FloatingActionButton  } from "../../services/StyledComponents";
import { CustomCursor } from "../CustomCursor";
import ParticlesBackground from "../ParticlesComponent";

function LandingPage() {
  const location = useLocation();
  const {userId, email } = location.state || {};
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        zIndex: 1000
      }}
    >
      <LoadingSpinner message="Loading..." />
    </motion.div>
    );
  }

  return (
    <Container darkMode={darkMode}>
      {/* <CustomCursor /> 
      <ParticlesBackground darkMode={darkMode} />*/}
      <Navigation onPageChange={handlePageChange} darkMode={darkMode} />

      <HeroSection darkMode={darkMode}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <img 
          src="src\assets\swifline_logo.webp" 
          alt="SwiftLine Logo" 
          style={{
            width: '110px', 
            marginBottom: '1rem',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        />
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: darkMode ? 'white' : '#2D3748',
            letterSpacing: '-0.02em'
          }}>
            Welcome to SwiftLine
            <span style={{ 
              color: '#8A9A8B',
              marginLeft: '0.5rem',
              display: 'inline-block'
            }}>⚡</span>
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: darkMode ? '#CBD5E0' : '#606F60',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            Queue Smarter, Not Harder – Your Time, Optimized. 
          </p>
        </motion.div>

        <ToggleButton 
          onClick={toggleDarkMode}
          darkMode={darkMode}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
        </ToggleButton>
      </HeroSection>

      <WelcomeMessage darkMode={darkMode}>
        👋 Hello, <strong style={{ color: '#8A9A8B' }}>{email}</strong>
      </WelcomeMessage>

      <ContentWrapper style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem 4rem'
      }}>
        {currentPage === "dashboard" && (
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <Dashboard onPageChange={handlePageChange} />
          </motion.div>
        )}
        {currentPage === "search" && (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <SearchEvents events={events} onPageChange={handlePageChange} userId={userId} />
          </motion.div>
        )}
        {currentPage === "myevents" && <MyEvents events={events.filter((event) => event.createdBy === email)} onPageChange={handlePageChange} />}
        {currentPage === "eventForm" && <EventForm onPageChange={handlePageChange} events={events} setEvents={setEvents} editingEvent={editingEvent} />}
        {currentPage === "myqueue" && <MyQueue />}
        {currentPage === "queueManagement" && <ViewQueue event={editingEvent} onSkip={handleSkip} />}
      </ContentWrapper>

      <FloatingActionButton 
        onClick={() => handlePageChange("eventForm")}
        aria-label="Create new event"
      >
        <FiPlus size={24} />
      </FloatingActionButton>
    </Container>
  );
}

export default LandingPage;
