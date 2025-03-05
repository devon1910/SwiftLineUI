
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

  function handlePageChange(e)
  {
      console.log(e)
      setCurrentPage(e);
  }

  // State for the queue information when a user joins an event
  const [myQueue, setMyQueue] = useState({
    eventId: null,
    position: null,
    estimatedWait: null
  });
  
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
