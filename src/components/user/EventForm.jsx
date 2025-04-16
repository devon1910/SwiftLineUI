import React, { useState } from "react";
import { format } from "date-fns";
import { createEvent } from "../../services/api/swiftlineService";
import { updateEvent } from "../../services/api/swiftlineService";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiClock,
  FiPlus,
  FiCheck,
  FiUsers,
  FiUserPlus,
  FiSliders,
} from "react-icons/fi";
import { LoaderCircle } from "lucide-react";

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

  const [staffCount, setStaffCount] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [minCapacity, setMinCapacity] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventId = editingEvent ? editingEvent.id : 0;
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
          .then((response) => {})
          .catch((error) => {
            console.log(error);
            toast.error(
              "There was an error in editing events. Please try again later."
            );
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
            toast.error(
              "There was an error in creating event. Please try again later."
            );
          });
      }
    }
  };

  const generateTimeOptions = () => {
    const options = [{ label: "Select Time", value: "" }];
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 60) {
        const time = new Date(1970, 0, 1, hours, minutes);
        const label = format(time, "h:mm a");
        const value = format(time, "HH:mm");
        options.push({ label, value });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Improved validation
  const validateEventStartEnd = () => {
    if (!eventStartTime || !eventEndTime) {
      toast.error("Please select both start and end times");
      return false;
    }

    if (eventStartTime == eventEndTime) {
      toast.error("Event start and end time can't be the same");
      return false;
    }

    // const start = new Date(`1970-01-01T${eventStartTime}`);
    // const end = new Date(`1970-01-01T${eventEndTime}`);

    // if (start >= end) {
    //   toast.error('End time must be after start time');
    //   return false;
    // }
    return true;
  };

  return (
    <form
      className="mt-5 max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
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
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-6 relative">
        <label
          htmlFor="eventDescription"
          className="block text-sm font-medium mb-1"
        >
          Event Description
        </label>
        <div className="relative">
          <textarea
            id="eventDescription"
            rows={5}
            maxLength={300}
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
          <label
            htmlFor="averageTime"
            className="block text-sm font-medium mb-1"
          >
            Average Wait Time (mins)
          </label>
          <div className="relative">
            <LoaderCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="averageTime"
              type="number"
              placeholder="5"
              min="0"
              max="60"
              value={averageTime}
              onChange={(e) => setAverageTime(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Number of Staff */}
        <div className="relative">
          <label
            htmlFor="staffCount"
            className="block text-sm font-medium mb-1"
          >
            Number of Staff
          </label>
          <div className="relative">
            <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="staffCount"
              type="number"
              placeholder="2"
              min="1"
              max="20"
              value={staffCount}
              onChange={(e) => setStaffCount(e.target.value)}
              required
              style={{ paddingLeft: "2.5rem" }}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="capacitySlider"
            className="block text-sm font-medium mb-2"
          >
            Queue Capacity: <span className="font-bold">{capacity}</span>/75
          </label>

          <div className="flex items-center gap-3">
            <FiUsers className="text-gray-400" />
            <input
              type="range"
              id="capacitySlider"
              min="1"
              max="75"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
            <FiUsers className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Time Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Start Time */}
        <div className="relative">
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Start Time
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="startTime"
              value={eventStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition "
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </div>
          </div>
        </div>

        {/* End Time */}
        <div className="relative">
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End Time
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="endTime"
              value={eventEndTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </div>
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
