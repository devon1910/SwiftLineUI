import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { createEvent } from "../../services/swiftlineService";
import { updateEvent } from "../../services/swiftlineService";

const EventForm = ({
  onPageChange,
  events,
  setEvents,
  editingEvent = null,
}) => {
  console.log(editingEvent);
  
  const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
  const [description, setDescription] = useState(
    editingEvent ? editingEvent.description : ""
  );
  const [averageTime, setAverageTime] = useState(
    editingEvent ? editingEvent.averageTime : ""
  );

  const [startTime, setStartTime] = useState(
    editingEvent ? editingEvent.eventStartTime.slice(0, -3) : ""
  );
  const [endTime, setEndTime] = useState(
    editingEvent ? editingEvent.eventEndTime.slice(0, -3) : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventId= editingEvent ? editingEvent.id : 0
    if (validateEventStartEnd()) {
      const newEvent = {
        eventId,
        title,
        description,
        startTime,
        endTime,
        averageTime,
      };

      if (editingEvent) {
       
        updateEvent(newEvent)
        .then((response) => {
          console.log(response.data);
          const updatedEvents = events.map((ev) =>
                ev.id === editingEvent.id
                  ? { ...ev, title, description, averageTime }
                  : ev
              );
              setEvents(updatedEvents);
        })
        .catch((error) => {
          console.log(error);
        });
        //setEvents(updatedEvents);
      } else {
        
        createEvent(newEvent)
          .then((response) => {
            console.log(response.data);
            setEvents([...events, newEvent]);
            
          })
          .catch((error) => {
            console.log(error);
          });
      }
      onPageChange("myevents");
    }
  };


  function validateEventStartEnd() {
    const startInd = startEndTime.indexOf(startTime);
    const endInd = startEndTime.indexOf(endTime);
    if (startInd === endInd) {
      alert(
        "The Event Start and end time cant be the same. Please select a different start/endtime."
      );
      return false;
    }

    return true;
  }

  // Helper arrays for hours, minutes, and meridiem.
  const startEndTime = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];
  //const minutes = ["00", "15", "30", "45"];
  //const meridiemOptions = ["AM", "PM"];

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
            required
          />
          <label htmlFor="Event Title">Event Title</label>
        </Form.Floating>
      </Form.Group>
      <Form.Group controlId="formDescription" className="mb-3">
        <Form.Floating>
          <Form.Control
            as="textarea"
            rows={6}
            placeholder="Enter event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <label htmlFor="Average time">Event Description</label>
        </Form.Floating>
      </Form.Group>
      {/* Average Time as a floating input */}
      <Row>
        <Col>
          <Form.Group controlId="formAverageTime" className="mb-3">
            <Form.Label>Average Time</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter average wait time (in minutes)"
              value={averageTime}
              onChange={(e) => setAverageTime(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formStartTime" className="mb-3">
            <Form.Label>Event Start Time</Form.Label>
            <Form.Select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}>
              {startEndTime.map((hr) => (
                <option key={hr} value={hr}>
                  {hr}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formEndTime" className="mb-8">
            <Form.Label>Event End Time</Form.Label>

            <Form.Select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {startEndTime.map((hr) => (
                <option key={hr} value={hr}>
                  {hr}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Start Time: Hour, Minute, Meridiem */}

      <Button variant="primary" type="submit">
        Save
      </Button>
    </Form>
  );
};

export default EventForm;
