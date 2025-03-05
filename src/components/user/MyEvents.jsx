import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap';

const MyEvents = ({ events, onPageChange }) => {
    return (
        <div>
          <h2 className="mt-4">My Events</h2>
          <Button variant="success" onClick={() => onPageChange("eventForm")}>
            Create New Event
          </Button>
          <Row className="mt-3">
            {events.map(event => (
              <Col md={4} key={event.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text>{event.description}</Card.Text>

                    {/* grid gap */}
                    <Row className='g-0'> 
                        <Col md={6}>
                            <Button variant="info" onClick={() => onPageChange("queueManagement")}>
                                View Queue
                            </Button>
                        </Col>
                        <Col md={6}>
                            <Button
                                variant="secondary"
                                className="ml-2"
                                onClick={() => onPageChange("eventForm")}>
                                Edit Event
                            </Button>
                        </Col>
                       
                    </Row>
                                 
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      );
}

export default MyEvents

