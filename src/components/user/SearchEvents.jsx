import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { joinLine } from "../../services/swiftlineService";
import { connection } from "../../services/SignalRConn";
import LoadingSpinner from "../LoadingSpinner";
import { GetUserQueueStatus } from "../../services/swiftlineService";
import { toast } from "react-toastify";

export const SearchEvents = ({ events, onPageChange, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue]= useState(true);

  const [isLoading, setIsLoading]= useState(true);

  // Filter events based on the search term
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

   useEffect(() => {
    getUserQueueStatus();
        setIsLoading(false)
      }, []);
    
      function getUserQueueStatus() {
        GetUserQueueStatus()
          .then((response) => {
            setIsUserInQueue(response.data.data);
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              window.location.href = '/';
            }
            console.log(error);
          });
      }
    

  // Styles for the active and inactive dot.
  const activeDotStyle = {
    width: "10px",
    height: "10px",
    backgroundColor: "#2ecc71", // project green
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
    animation: "beep 1.5s infinite",
  };

  const inactiveDotStyle = {
    width: "10px",
    height: "10px",
    backgroundColor: "#bdc3c7", // a neutral gray
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
  };


  const joinQueue = async (event) => {
    const eventId = event.id;
    
    // Check if the SignalR connection is in a connected state
    if (connection.state !== "Connected") {
      toast.info("Connection lost. Attempting to reconnect...");
      try {
        await connection.start();  // Try to reconnect
        toast.success("Reconnected successfully.");
      } catch (reconnectError) {
        console.error("Reconnection failed:", reconnectError);
        toast.error("Unable to reconnect. Please check your network.");
        return;
      }
    }
    
    // Once connected, try to join the queue
    connection
      .invoke("JoinQueueGroup", eventId, userId)
      .then(() => {
        toast.success("Joined queue successfully.");
        onPageChange("myqueue");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error joining queue. Please try again.");
      });
  };


  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div>
      <h2 className="mt-4">Search Events</h2>
      <Form>
        <Form.Group controlId="search">
          <Form.Control
            type="text"
            placeholder="Search for events by their titles"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </Form>
      <br />
      <Row>
        {filteredEvents.map((event) => (
          <Col md={4} key={event.id} className="mb-3">
            <Card
              style={{
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "none",
              }}
            >
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <span
                  style={event.isActive ? activeDotStyle : inactiveDotStyle}
                ></span>
              </div>
              <Card.Body>
                <Card.Title>{event.title}</Card.Title>
                <Card.Text>{event.description}</Card.Text>
                <Card.Text>Average Wait: {event.averageTime} mins</Card.Text>
                <Card.Text>Users in Queue: {event.usersInQueue}</Card.Text>
                <Card.Text>
                  Event Duration: {event.eventStartTime} - {event.eventEndTime}
                </Card.Text>
                <Card.Text>Organizer: {event.createdBy}</Card.Text>
                <Button disabled={isUserInQueue} variant="primary" onClick={() => joinQueue(event)}>
                  Join Queue
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SearchEvents;
