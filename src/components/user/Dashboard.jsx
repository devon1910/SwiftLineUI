import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap';

const Dashboard = ({onPageChange}) => {
  return (
    <Row className="mt-4">
      <Col md={6}>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Create New Event</Card.Title>
            <Card.Text>
              Manage and monitor your own event queues.
            </Card.Text>
            <Button variant="primary" onClick={() => onPageChange("myevents")}>
              Go to My Events
            </Button>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Join a Queue</Card.Title>
            <Card.Text>
              Search for active events and join the queue.
            </Card.Text>
            <Button variant="success" onClick={() => onPageChange("search")}>
              Search Events
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default Dashboard


