import React, { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './Dashboard'
import Navigation from './Navigation';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import SearchEvents from './SearchEvents';
import MyEvents from './MyEvents';
import EventForm from './EventForm';
import MyQueue from './MyQueue';
import ViewQueue from './ViewQueue';
import { eventsList } from '../../services/swiftlineService';

function LandingPage() {

  // Current page state to control which component to display
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [editingEvent, setEditingEvent] = useState(null);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEventsList();
  },[])
  
  function getEventsList(){
    eventsList().then((response) => {
        setEvents(response.data.data);
    }).catch((error) => {
      console.log(error);
    })
  }
  


  const handlePageChange = (page, event = null) => {
    if (event) 
    {
      setEditingEvent(event); // Set the event to be edited
    }
    else
    {
      setEditingEvent(null);
    }
      setCurrentPage(page);
  };
  // State for the queue information when a user joins an event
  const [myQueue, setMyQueue] = useState({
    eventId: null,
    position: null,
    estimatedWait: null
  });

  const queue1 = [
    { id: 101, name: "Alice", joinTime: "10:05 AM" },
    { id: 102, name: "Bob", joinTime: "10:07 AM" }
  ];

  const handleSkip = (userId) => {
    // Implement logic to skip the user
    console.log(`Skipping user with ID: ${userId}`);
  };
  
  return (
    <div>
      <Navigation onPageChange={handlePageChange} />
      <Container>
        {currentPage === "dashboard" && <Dashboard onPageChange={handlePageChange} />}
        {currentPage === "search" && (
          <SearchEvents
            events={events}
            onPageChange={handlePageChange}
            setMyQueue={setMyQueue}
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
          <MyQueue myQueue={myQueue} events={events} />
        )}
        {currentPage === "queueManagement" && (
          <ViewQueue  event={editingEvent} queue={queue1} onSkip={handleSkip}/>
        )}
      </Container>
    </div>
  );
}

export default LandingPage
