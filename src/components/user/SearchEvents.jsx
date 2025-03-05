import React, { useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap';



export const SearchEvents = ({ events, onPageChange, setMyQueue }) => {
    //return (<h1>Hello Search Events</h1>)
    const [searchTerm, setSearchTerm] = useState("");
  
    // Filter events based on the search term
    const filteredEvents = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
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
                placeholder="Search for events" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Form><br/>
          <Row>
            {filteredEvents.map(event => (
              <Col md={4} key={event.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text>{event.description}</Card.Text>
                    <Card.Text>Average Wait: {event.averageTime} mins</Card.Text>
                    <Card.Text>Users in Queue: {event.usersInQueue}</Card.Text>
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
