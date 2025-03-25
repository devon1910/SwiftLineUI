import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { createEvent } from "../../services/swiftlineService";
import { updateEvent } from "../../services/swiftlineService";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const EventForm = ({
  onPageChange,
  events,
  setEvents
}) => {
  
  const location = useLocation();
  const navigator = useNavigate();

  const editingEvent = location.state?.editingEvent;

  console.log("editingEvent: ", editingEvent);  
  
  const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
  const [description, setDescription] = useState(
    editingEvent ? editingEvent.description : ""
  );
  const [averageTime, setAverageTime] = useState(
    editingEvent ? editingEvent.averageTime : ""
  );

  const [eventStartTime, setStartTime] = useState(
    editingEvent ? editingEvent.eventStartTime.slice(0, -3) : ""
  );
  const [eventEndTime, setEndTime] = useState(
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
        eventStartTime,
        eventEndTime,
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
              navigator("/myevents");
        })
        .catch((error) => {
          console.log(error);
          toast.error("There was an error in editing events. Please try again later.");
          navigator("/myevents");
        });
        //setEvents(updatedEvents);
      } else {
        
        createEvent(newEvent)
          .then((response) => {   
            newEvent["usersInQueue"]= 0
            setEvents([...events, newEvent]);
            console.log("new Events List: ", [...events, newEvent]);
            navigator("/myevents");
          })
          .catch((error) => {
            console.log(error);
            toast.error("There was an error in creating event. Please try again later.");
          });
      }   
    }
  };


  function validateEventStartEnd() {
    const startInd = startEndTime.indexOf(eventStartTime);
    const endInd = startEndTime.indexOf(eventEndTime);
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
    <form 
      className="mt-5 max-w-3xl mx-auto p-4 sm:p-6 md:p-8  rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
      <h3 className="text-xl  sm:text-2xl font-semibold mb-6 pb-2 border-b-2 border-emerald-700/60 text-gray-800 dark:text-gray-800">
        {editingEvent ? "Edit Event" : "Create New Event"}
      </h3>
  
      {/* Title Input */}
      <div className="mb-6">
        <label 
          htmlFor="eventTitle" 
          className="block text-sm font-medium mb-1"
        >
          Event Title
        </label>
        <input
          id="eventTitle"
          type="text"
          placeholder="Enter event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
        />
      </div>
  
      {/* Description Input */}
      <div className="mb-6">
        <label 
          htmlFor="eventDescription" 
          className="block text-sm font-medium mb-1"
        >
          Event Description
        </label>
        <textarea
          id="eventDescription"
          rows={5}
          placeholder="Enter event description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-3 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-y"
        />
      </div>
  
      {/* Input Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label 
            htmlFor="averageTime" 
            className="block text-sm font-medium mb-1"
          >
            Average Wait Time (mins)
          </label>
          <input
            id="averageTime"
            type="number"
            placeholder="Enter minutes"
            min="0"
            max="60"
            value={averageTime}
            onChange={(e) => setAverageTime(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition  "
          />
        </div>
  
        <div>
          <label 
            htmlFor="startTime" 
            className="block text-sm font-medium mb-1"
          >
            Start Time
          </label>
          <select
            id="startTime"
            value={eventStartTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition  dark:bg-white text-gray-900 dark:text-gray-900"
          >
            {startEndTime.map((hr) => (
              <option key={hr} value={hr}>{hr}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label 
            htmlFor="endTime" 
            className="block text-sm font-medium mb-1"
          >
            End Time
          </label>
          <select
            id="endTime"
            value={eventEndTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition dark:bg-white text-gray-900 dark:text-gray-900"
          >
            {startEndTime.map((hr) => (
              <option key={hr} value={hr}>{hr}</option>
            ))}
          </select>
        </div>
      </div>
  
      {/* Submit Button */}
      <button 
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-2 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white"
      >
        {editingEvent ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
};

export default EventForm;
