import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./Dashboard";
import Navigation from "./Navigation";
import { useState } from "react";
import { Container } from "react-bootstrap";
import SearchEvents from "./SearchEvents";
import MyEvents from "./MyEvents";
import EventForm from "./EventForm";
import MyQueue from "./MyQueue";
import ViewQueue from "./ViewQueue";
import { eventsList } from "../../services/swiftlineService";
import { useLocation } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";

function LandingPage() {
  const location = useLocation();
  const { userId,email } = location.state || {}; 
  // Current page state to control which component to display
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [editingEvent, setEditingEvent] = useState(null);

  const [events, setEvents] = useState([]);

  const [isLoading, setIsLoading]= useState(true);

  const userEvents= events.filter((event) => event.createdBy === email);

  useEffect(() => {
    getEventsList();
    setIsLoading(false)
  }, []);

  function getEventsList() {
    eventsList()
      .then((response) => {
        setEvents(response.data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/';
        }
        console.log(error);
      });
  }

  const handlePageChange = (page, event = null) => {
    event ? setEditingEvent(event) : setEditingEvent(null);
    setCurrentPage(page);
  };

  const handleSkip = (userId) => {
    // Implement logic to skip the user
    console.log(`Skipping user with ID: ${userId}`);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }
  return (
    <div>
      <Navigation onPageChange={handlePageChange} />
      <center><h3> Hello🙂, {email} and {userId}</h3></center>
      <Container>
        {currentPage === "dashboard" && (
          <Dashboard onPageChange={handlePageChange} />
        )}
        {currentPage === "search" && (
          <SearchEvents
            events={events}
            onPageChange={handlePageChange}
            userId={userId}
          />
        )}
        {currentPage === "myevents" && (
          <MyEvents events={userEvents} onPageChange={handlePageChange} />
        )}
        {currentPage === "eventForm" && (
          <EventForm
            onPageChange={handlePageChange}
            events={events}
            setEvents={setEvents}
            editingEvent={editingEvent}
          />
        )}
        {currentPage === "myqueue" && (
          <MyQueue
          />
        )}
        {currentPage === "queueManagement" && (
          <ViewQueue event={editingEvent} onSkip={handleSkip} />
        )}
      </Container>
    </div>
  );
}

export default LandingPage;
