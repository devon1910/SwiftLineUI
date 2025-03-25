import React, { useState } from "react";
import { format } from 'date-fns';
import { createEvent } from "../../services/swiftlineService";
import { updateEvent } from "../../services/swiftlineService";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { FiType, FiAlignLeft, FiClock, FiPlus, FiCheck } from 'react-icons/fi';

const EventForm = () => {
  
  const location = useLocation();
  const navigator = useNavigate();

  const editingEvent = location.state?.editingEvent;
  
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
        })
        .catch((error) => {
          console.log(error);
          toast.error("There was an error in editing events. Please try again later.");
        });
        navigator("/myEvents");
        //setEvents(updatedEvents);
      } else {
        
        createEvent(newEvent)
          .then((response) => {   
            navigator("/myEvents");
          })
          .catch((error) => {
            console.log(error);
            toast.error("There was an error in creating event. Please try again later.");
          });
      }   
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 60) {
        const time = new Date(1970, 0, 1, hours, minutes);
        const label = format(time, 'h:mm a');
        const value = format(time, 'HH:mm');
        options.push({ label, value });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Improved validation
  const validateEventStartEnd = () => {
    if (!eventStartTime || !eventEndTime) {
      toast.error('Please select both start and end times');
      return false;
    }

    const start = new Date(`1970-01-01T${eventStartTime}`);
    const end = new Date(`1970-01-01T${eventEndTime}`);

    if (start >= end) {
      toast.error('End time must be after start time');
      return false;
    }
    return true;
  };

  return (
    <form className="mt-5 max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
      <h3 className="text-xl sm:text-2xl font-semibold mb-6 pb-2 border-b-2 border-emerald-700/60 flex items-center gap-2">
        {editingEvent ? (
          <>
            <FiCheck className="w-6 h-6" />
            Edit Event
          </>
        ) : (
          <>
            <FiPlus className="w-6 h-6" />
            Create New Event
          </>
        )}
      </h3>

      {/* Title Input */}
      <div className="mb-6 relative">
        <label htmlFor="eventTitle" className="block text-sm font-medium mb-1">
          Event Title
        </label>
        <div className="relative">
          <input
            id="eventTitle"
            type="text"
            placeholder="Tech Conference 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-6 relative">
        <label htmlFor="eventDescription" className="block text-sm font-medium mb-1">
          Event Description
        </label>
        <div className="relative">
          <textarea
            id="eventDescription"
            rows={5}
            placeholder="Describe your event details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-y"
          />
        </div>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Average Wait Time */}
        <div className="relative">
          <label htmlFor="averageTime" className="block text-sm font-medium mb-1">
            Average Wait Time (mins)
          </label>
          <div className="relative">
            <input
              id="averageTime"
              type="number"
              placeholder="15"
              min="0"
              max="60"
              value={averageTime}
              onChange={(e) => setAverageTime(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Start Time */}
        <div className="relative">
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Start Time
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              id="startTime"
              value={eventStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* End Time */}
        <div className="relative">
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End Time
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              id="endTime"
              value={eventEndTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-2 flex items-center justify-center gap-2"
      >
        {editingEvent ? (
          <>
            <FiCheck className="w-5 h-5" />
            Save Changes
          </>
        ) : (
          <>
            <FiPlus className="w-5 h-5" />
            Create Event
          </>
        )}
      </button>
    </form>
  );
};

export default EventForm;
