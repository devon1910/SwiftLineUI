import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const EventForm = ({
  onPageChange,
  events,
  setEvents,
  editingEvent = null,
}) => {
  const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
  const [description, setDescription] = useState(
    editingEvent ? editingEvent.description : ""
  );
  const [averageTime, setAverageTime] = useState(
    editingEvent ? editingEvent.averageTime : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      // Update the existing event
      const updatedEvents = events.map((ev) =>
        ev.id === editingEvent.id
          ? { ...ev, title, description, averageTime }
          : ev
      );
      setEvents(updatedEvents);
    } else {
      // Create a new event with a new id and initial usersInQueue count
      const newEvent = {
        id: events.length + 1,
        title,
        description,
        averageTime,
        usersInQueue: 0,
      };
      setEvents([...events, newEvent]);
    }
    onPageChange("myevents");
  };

  return (
    <Form className="mt-5" onSubmit={handleSubmit}>
      <h3>{editingEvent ? "Edit Event" : "Create New Event"}</h3>
      <Form.Group controlId="formTitle" className="mb-3">
        <Form.Floating>
          <Form.Control
            type="text"
            placeholder="Enter event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="Event Title">Event Title</label>
        </Form.Floating>
      </Form.Group>
      <Form.Group controlId="formDescription" className="mb-3">
        <Form.Floating>
          <Form.Control
            type="text"
            placeholder="Enter event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label htmlFor="Average time">Event Description</label>
        </Form.Floating>
      </Form.Group>
      <Form.Group controlId="formAverageTime" className="mb-3">
        <Form.Floating>
          <Form.Control
            type="number"
            placeholder="Enter average wait time(in minutes)"
            value={averageTime}
            onChange={(e) => setAverageTime(e.target.value)}/>
          <label htmlFor="Average time">Average Time (in minutes)</label>
        </Form.Floating>
      </Form.Group>
      <Button variant="primary" type="submit">
        Save
      </Button>
    </Form>
  );
};

export default EventForm;
