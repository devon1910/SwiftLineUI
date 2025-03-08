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
import { HubConnectionBuilder } from "@microsoft/signalr";
import { connection } from "../../services/SignalRConn";
import { useLocation } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";

function LandingPage() {
  const location = useLocation();
  const { userId } = location.state || {}; 
  // Current page state to control which component to display
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [editingEvent, setEditingEvent] = useState(null);

  const [events, setEvents] = useState([]);

  const [isLoading, setIsLoading]= useState(true);

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
        console.log(error);
      });
  }

  const handlePageChange = (page, event = null) => {
    if (event) {
      setEditingEvent(event); // Set the event to be edited
    } else {
      setEditingEvent(null);
    }
    setCurrentPage(page);
  };
  // State for the queue information when a user joins an event
  const [myQueue, setMyQueue] = useState({
    eventId: null,
    position: null,
    estimatedWait: null,
  });



  const handleSkip = (userId) => {
    // Implement logic to skip the user
    console.log(`Skipping user with ID: ${userId}`);
  };

  console.log("connection: ", connection);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }
  return (
    <div>
      <Navigation onPageChange={handlePageChange} />
      <Container>
        {currentPage === "dashboard" && (
          <Dashboard onPageChange={handlePageChange} />
        )}
        {currentPage === "search" && (
          <SearchEvents
            events={events}
            onPageChange={handlePageChange}
            setMyQueue={setMyQueue}
            userId={userId}
          />
        )}
        {currentPage === "myevents" && (
          <MyEvents events={events} onPageChange={handlePageChange} />
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
            myQueue={myQueue}
            events={events}
            updateLineInfo={setMyQueue}
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
