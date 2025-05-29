import React, { useState } from "react";
import { format } from "date-fns";
import { createEvent, updateEvent } from "../../services/api/swiftlineService";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiClock,
  FiPlus,
  FiCheck,
  FiUsers,
  FiInfo,
  FiLock,
} from "react-icons/fi";
import { LoaderCircle, LockKeyholeOpen } from "lucide-react";
import { useTheme } from "../../services/utils/useTheme";
import { ArrowReturnLeft } from "react-bootstrap-icons";

const EventForm = () => {
  const location = useLocation();
  const navigator = useNavigate();

  const { darkMode } = useTheme();

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

  const [staffCount, setStaffCount] = useState(
    editingEvent ? editingEvent.staffCount : 1
  );
  const [capacity, setCapacity] = useState(
    editingEvent ? editingEvent.capacity : 50
  );
  const [allowAnonymous, setAllowAnonymous] = useState(
    editingEvent ? editingEvent.allowAnonymousJoining : false
  );

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
        staffCount,
        capacity,
        allowAnonymousJoining: allowAnonymous,
      };

      if (editingEvent) {
        updateEvent(newEvent)
          .then(() => {
            toast.success("Event updated successfully!"); // Added success toast
            navigator("/myEvents");
          })
          .catch((error) => {
            console.error("Error updating event:", error); // Use console.error
            toast.error(
              "There was an error updating the event. Please try again later."
            );
          });
      } else {
        createEvent(newEvent)
          .then(() => {
            toast.success("Event created successfully!"); // Added success toast
            navigator("/myEvents");
          })
          .catch((error) => {
            console.error("Error creating event:", error); // Use console.error
            toast.error(
              "There was an error creating the event. Please try again later."
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
      toast.error("Please select both start and end times.");
      return false;
    }

    const start = new Date(`1970-01-01T${eventStartTime}`);
    const end = new Date(`1970-01-01T${eventEndTime}`);

    if (start >= end) {
      toast.error("End time must be after start time.");
      return false;
    }
    return true;
  };

  return (
    <form
      className={`mt-8 max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl shadow-lg transition-colors duration-300
        ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}
      `}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigator("/myEvents")}
          className={`
            p-2 rounded-full transition-all duration-200
            ${darkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}
          `}
          aria-label="Go back to My Events"
        >
          <ArrowReturnLeft className="w-6 h-6" />
        </button>
        <h3 className={`text-2xl sm:text-3xl font-bold flex items-center gap-3
          ${darkMode ? "text-white" : "text-gray-900"}
        `}>
          {editingEvent ? (
            <>
              <FiCheck className="w-7 h-7 text-sage-500" />
              Edit Event
            </>
          ) : (
            <>
              <FiPlus className="w-7 h-7 text-sage-500" />
              Create New Event
            </>
          )}
        </h3>
      </div>

      {/* Title Input */}
      <div className="mb-6">
        <label htmlFor="eventTitle" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="eventTitle"
            type="text"
            placeholder="e.g., Tech Conference 2024"
            value={title}
            disabled={!!editingEvent} 
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={`w-full pl-4 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
              ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}
              ${editingEvent ? "opacity-70 cursor-not-allowed" : ""}
            `}
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <label htmlFor="eventDescription" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="eventDescription"
            rows={4} // Reduced rows slightly for a compact look
            maxLength={300}
            placeholder="Describe your event details, purpose, or what attendees can expect..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={`w-full pl-4 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200 resize-y
              ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}
            `}
          />
        </div>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"> {/* Increased gap */}
        {/* Average Wait Time */}
        <div className="relative">
          <label htmlFor="averageTime" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            Avg. Wait Time (mins) <span className="text-red-500">*</span>
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}
              `}
            />
          </div>
        </div>

        {/* Number of Staff */}
        <div className="relative">
          <label htmlFor="staffCount" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            Serving Staff No. <span className="text-red-500">*</span>
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}
              `}
            />
          </div>
        </div>

        {/* Capacity Slider */}
        <div>
          <label htmlFor="capacitySlider" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            Queue Capacity: <span className="font-bold text-sage-500">{capacity}</span>/75
          </label>
          <div className="flex items-center gap-3">
            <FiUsers className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            <input
              type="range"
              id="capacitySlider"
              min="1"
              max="75"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer
                ${darkMode ? "bg-gray-600 accent-sage-500" : "bg-gray-300 accent-sage-500"}
              `}
              style={{
                '--range-thumb-bg': darkMode ? '#698474' : '#698474', // Tailwind 'sage-500'
                '--range-track-bg': darkMode ? '#4b5563' : '#d1d5db', // Tailwind 'gray-600' or 'gray-300'
              }}
            />
            <FiUsers className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
          </div>
        </div>
      </div>

      {/* Time Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6"> {/* Increased gap */}
        {/* Start Time */}
        <div className="relative">
          <label htmlFor="startTime" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            Start Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="startTime"
              value={eventStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}
              `}
              required
            >
              {timeOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className={`${
                    option.value === eventStartTime
                      ? "bg-sage-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* End Time */}
        <div className="relative">
          <label htmlFor="endTime" className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            End Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="endTime"
              value={eventEndTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}
              `}
              required
            >
              {timeOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className={`${
                    option.value === eventEndTime
                      ? "bg-sage-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Allow Anonymous Joining Toggle */}
      <div className={`mb-8 p-4 rounded-lg flex items-center justify-between transition-colors duration-300
        ${darkMode ? "bg-gray-700 shadow-inner" : "bg-gray-100 shadow-sm"}
      `}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAllowAnonymous(!allowAnonymous)}
            className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2
              ${darkMode ? "focus:ring-offset-gray-700" : "focus:ring-offset-gray-100"}
              ${allowAnonymous ? "bg-sage-500" : "bg-gray-400 dark:bg-gray-600"}
            `}
            aria-checked={allowAnonymous}
            role="switch"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
                ${allowAnonymous ? "translate-x-6 bg-white" : "translate-x-0 bg-white"}
              `}
            >
              {allowAnonymous ? (
                <LockKeyholeOpen className="w-4 h-4 text-sage-500" />
              ) : (
                <FiLock className="w-4 h-4 text-gray-500" />
              )}
            </span>
          </button>
          <div className="flex flex-col">
            <span className={`text-base font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              Allow Anonymous Joining
            </span>
            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {allowAnonymous
                ? "Guests can join without an account"
                : "Requires account to join"}
            </span>
          </div>
        </div>
        <div className="relative group flex-shrink-0">
          <FiInfo className={`w-5 h-5 cursor-pointer transition-colors duration-200
            ${darkMode ? "text-gray-400 hover:text-sage-400" : "text-gray-500 hover:text-sage-600"}
          `} />
          <div className={`
            absolute hidden group-hover:block w-56 p-3 text-sm rounded-lg bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 shadow-lg
            ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-800 text-white"}
          `}>
            Allows participants to join using temporary guest access without requiring account creation.
            <div className={`absolute w-3 h-3 rotate-45 -bottom-1 left-1/2 -translate-x-1/2
              ${darkMode ? "bg-gray-700" : "bg-gray-800"}
            `}></div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6 flex items-center justify-center gap-2
          ${darkMode ? "bg-sage-600 hover:bg-sage-700 focus:ring-sage-500 focus:ring-offset-gray-800 shadow-md hover:shadow-lg" : "bg-sage-500 hover:bg-sage-600 focus:ring-sage-500 focus:ring-offset-white shadow-md hover:shadow-lg"}
        `}
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