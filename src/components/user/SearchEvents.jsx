import React, { useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap';



export const SearchEvents = ({ events, onPageChange, setMyQueue }) => {
    //return (<h1>Hello Search Events</h1>)
    const [searchTerm, setSearchTerm] = useState("");
  
    // Filter events based on the search term
    const filteredEvents = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

        // Styles for the active and inactive dot.
    const activeDotStyle = {
      width: '10px',
      height: '10px',
      backgroundColor: '#2ecc71', // project green
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '8px',
      animation: 'beep 1.5s infinite'
    };

    const inactiveDotStyle = {
      width: '10px',
      height: '10px',
      backgroundColor: '#bdc3c7', // a neutral gray
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '8px'
    };
  
    // Simulate joining a queue by setting the myQueue state
    const joinQueue = (event) => {
      const position = event.usersInQueue + 1; // New user joins at the end
      const estimatedWait = event.averageTime * position;
      setMyQueue({ eventId: event.id, position, estimatedWait });
      onPageChange("myqueue");
    };
  
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
          </Form><br/>
          <Row>
            {filteredEvents.map(event => (
              <Col md={4} key={event.id} className="mb-3">
                <Card style={{
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: 'none'
                      }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span style={event.isActive ? activeDotStyle : inactiveDotStyle}></span>
                  </div>
                  <Card.Body>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text>{event.description}</Card.Text>
                    <Card.Text>Average Wait: {event.averageTime} mins</Card.Text>
                    <Card.Text>Users in Queue: {event.usersInQueue}</Card.Text>
                    <Card.Text>Event Duration: {event.eventStartTime} - {event.eventEndTime}</Card.Text>
                    <Card.Text>Organizer: {event.createdBy}</Card.Text>
                    <Button variant="primary" onClick={() => joinQueue(event)}>
                      Join Queue
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
    );
}

export default SearchEvents
