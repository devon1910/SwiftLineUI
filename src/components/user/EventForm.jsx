import React, { useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

const EventForm = ({ onPageChange, events, setEvents, editingEvent = null }) => {
    const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
    const [description, setDescription] = useState(editingEvent ? editingEvent.description : "");
    const [averageTime, setAverageTime] = useState(editingEvent ? editingEvent.averageTime : "");
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingEvent) {
        // Update the existing event
        const updatedEvents = events.map(ev =>
          ev.id === editingEvent.id ? { ...ev, title, description, averageTime } : ev
        );
        setEvents(updatedEvents);
      } else {
        // Create a new event with a new id and initial usersInQueue count
        const newEvent = { id: events.length + 1, title, description, averageTime, usersInQueue: 0 };
        setEvents([...events, newEvent]);
      }
      onPageChange("myevents");
    };

    return (
        <Form className="mt-4" onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle">
            <Form.Label>Event Title</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter event title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter event description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formAverageTime">
            <Form.Label>Average Wait Time (mins)</Form.Label>
            <Form.Control 
              type="number" 
              placeholder="Enter average wait time" 
              value={averageTime}
              onChange={(e) => setAverageTime(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      );
}

export default EventForm

