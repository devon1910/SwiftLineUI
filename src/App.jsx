
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './components/user/Dashboard';
import Navigation from './components/user/Navigation';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import SearchEvents from './components/user/SearchEvents';
import MyEvents from './components/user/MyEvents';
import EventForm from './components/user/EventForm';
import MyQueue from './components/user/MyQueue';
import ViewQueue from './components/user/ViewQueue';

function App() {

  // Current page state to control which component to display
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [editingEvent, setEditingEvent] = useState(null);

  // Events state: this would typically come from your backend API.
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Coffee Shop Queue",
      description: "Manage your coffee line",
      averageTime: 5,
      usersInQueue: 3
    },
    {
      id: 2,
      title: "Bank Line",
      description: "Get your tickets online",
      averageTime: 10,
      usersInQueue: 5
    }
  ]);

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
  // return (
  //   <div>
  //     <BrowserRouter>
  //       <Routes>
  //         <Route path="/" element={<AuthForm />}></Route>
  //         <Route path="/dashboard" element={<Navigation onPageChange="dashboard"/>}></Route>
  //       </Routes>
  //     </BrowserRouter>
  //   </div>
  // );
}

export default App
