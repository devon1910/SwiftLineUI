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
              onPageChange("myevents");
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
            onPageChange("myevents");
          })
          .catch((error) => {
            console.log(error);
          });
      }
      
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
    <Form 
      className="mt-5" 
      onSubmit={handleSubmit}
      style={{
        fontFamily: 'Inter, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <h3 style={{
        color: '#000',
        fontWeight: 600,
        marginBottom: '2rem',
        borderBottom: '2px solid #8A9A8B',
        paddingBottom: '0.5rem'
      }}>
        {editingEvent ? "Edit Event" : "Create New Event"}
      </h3>

      {/* Title Input */}
      <Form.Group controlId="formTitle" className="mb-4">
        <Form.Floating>
          <Form.Control
            type="text"
            placeholder="Enter event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              borderColor: '#8A9A8B',
              borderRadius: '6px',
              fontFamily: 'Inter'
            }}
          />
          <label 
            htmlFor="Event Title" 
            style={{ color: '#606F60', fontFamily: 'Inter' }}
          >
            Event Title
          </label>
        </Form.Floating>
      </Form.Group>

      {/* Description Input */}
      <Form.Group controlId="formDescription" className="mb-4">
        <Form.Floating>
          <Form.Control
            as="textarea"
            rows={6}
            placeholder="Enter event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              borderColor: '#8A9A8B',
              borderRadius: '6px',
              fontFamily: 'Inter'
            }}
          />
          <label 
            htmlFor="Average time" 
            style={{ color: '#606F60', fontFamily: 'Inter' }}
          >
            Event Description
          </label>
        </Form.Floating>
      </Form.Group>

      {/* Input Row */}
      <Row className="g-4">
        <Col md={4}>
          <Form.Group controlId="formAverageTime" className="mb-3">
            <Form.Label style={{ color: '#000', fontWeight: 500 }}>Average Wait Time (mins)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter minutes"
              value={averageTime}
              onChange={(e) => setAverageTime(e.target.value)}
              required
              style={{
                borderColor: '#8A9A8B',
                borderRadius: '6px',
                fontFamily: 'Inter'
              }}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="formStartTime" className="mb-3">
            <Form.Label style={{ color: '#000', fontWeight: 500 }}>Start Time</Form.Label>
            <Form.Select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                borderColor: '#8A9A8B',
                borderRadius: '6px',
                fontFamily: 'Inter',
                color: '#000'
              }}
            >
              {startEndTime.map((hr) => (
                <option key={hr} value={hr}>{hr}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="formEndTime" className="mb-3">
            <Form.Label style={{ color: '#000', fontWeight: 500 }}>End Time</Form.Label>
            <Form.Select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{
                borderColor: '#8A9A8B',
                borderRadius: '6px',
                fontFamily: 'Inter',
                color: '#000'
              }}
            >
              {startEndTime.map((hr) => (
                <option key={hr} value={hr}>{hr}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Submit Button */}
      <Button 
        variant="primary" 
        type="submit"
        style={{
          backgroundColor: '#8A9A8B',
          border: 'none',
          borderRadius: '6px',
          padding: '0.75rem 2rem',
          fontWeight: 600,
          fontFamily: 'Inter',
          marginTop: '1.5rem',
          width: '100%',
          transition: 'all 0.2s ease',
          ':hover': {
            backgroundColor: '#6B7D6B',
            transform: 'translateY(-1px)'
          }
        }}
      >
        {editingEvent ? "Save Changes" : "Create Event"}
      </Button>
    </Form>
  );
};

export default EventForm;
