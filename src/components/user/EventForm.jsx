import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { createEvent, fetchEventById, updateEvent } from "../../services/swiftlineService";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {  FiClock, FiPlus, FiCheck } from "react-icons/fi";
import {  LoaderCircle } from "lucide-react";

const EventForm = () => {
  const location = useLocation();
  const navigator = useNavigate();
  const { eventId: routeEventId } = useParams();

  const editingEvent = location.state?.editingEvent;
  const isEditing = Boolean(routeEventId || editingEvent);

  const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
  const [description, setDescription] = useState(
    editingEvent ? editingEvent.description : ""
  );
  const [averageTime, setAverageTime] = useState(
    editingEvent ? editingEvent.averageTime : ""
  );
  const [capacity, setCapacity] = useState(editingEvent?.capacity ?? 50);
  const [staffCount, setStaffCount] = useState(editingEvent?.staffCount ?? 1);
  const [allowAnonymousJoining, setAllowAnonymousJoining] = useState(editingEvent?.allowAnonymousJoining ?? false);
  const [allowAutomaticSkips, setAllowAutomaticSkips] = useState(editingEvent?.allowAutomaticSkips ?? true);
  const [enableGeographicRestriction, setEnableGeographicRestriction] = useState(editingEvent?.enableGeographicRestriction ?? false);
  const [address, setAddress] = useState(editingEvent?.address ?? "");
  const [latitude, setLatitude] = useState(editingEvent?.latitude ?? null);
  const [longitude, setLongitude] = useState(editingEvent?.longitude ?? null);
  const [radiusInMeters, setRadiusInMeters] = useState(editingEvent?.radiusInMeters ?? 0);

  const [eventStartTime, setStartTime] = useState(
    editingEvent ? editingEvent.eventStartTime.slice(0, -3) : ""
  );
  const [eventEndTime, setEndTime] = useState(
    editingEvent ? editingEvent.eventEndTime.slice(0, -3) : ""
  );

  useEffect(() => {
    if (!routeEventId || editingEvent) return;
    fetchEventById(routeEventId)
      .then(({ data }) => {
        const event = data.data;
        setTitle(event.title);
        setDescription(event.description);
        setAverageTime(event.averageTime);
        setStartTime(event.eventStartTime.slice(0, 5));
        setEndTime(event.eventEndTime.slice(0, 5));
        setCapacity(event.capacity);
        setStaffCount(event.staffCount);
        setAllowAnonymousJoining(event.allowAnonymousJoining);
        setAllowAutomaticSkips(event.allowAutomaticSkips);
        setEnableGeographicRestriction(event.enableGeographicRestriction);
        setAddress(event.address ?? "");
        setLatitude(event.latitude ?? null);
        setLongitude(event.longitude ?? null);
        setRadiusInMeters(event.radiusInMeters ?? 0);
      })
      .catch(() => toast.error("Unable to load the event for editing."));
  }, [routeEventId, editingEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventId = Number(routeEventId ?? editingEvent?.id ?? 0);
    if (validateEventStartEnd()) {
      const newEvent = {
        eventId,
        title,
        description,
        eventStartTime,
        eventEndTime,
        averageTime,
        capacity: Number(capacity),
        staffCount: Number(staffCount),
        allowAnonymousJoining,
        allowAutomaticSkips,
        enableGeographicRestriction,
        address: address || null,
        latitude,
        longitude,
        radiusInMeters: Number(radiusInMeters),
      };

      if (isEditing) {
        updateEvent(newEvent)
          .then(() => {})
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
          .then(() => {
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

    if (eventEndTime <= eventStartTime) {
      toast.error("End time must be after start time");
      return false;
    }
    return true;
  };

  return (
    <form
      className="event-form mt-5 max-w-3xl mx-auto p-4 sm:p-6 md:p-8 rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
      <p className="event-form__eyebrow">Organizer workspace</p>
      <h3 className="text-xl sm:text-2xl font-semibold mb-2 flex items-center gap-2">
        {isEditing ? (
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
      <p className="event-form__lede mb-6">Set the rhythm before people arrive. You can fine-tune the details later.</p>

      {/* Title Input */}
      <div className="event-form__section mb-6 relative">
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
      <div className="event-form__section mb-6 relative">
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
            placeholder="Describe your event details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-y"
          />
        </div>
      </div>

      {/* Input Row */}
      <div className="event-form__section grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              className="w-full appearance-none pl-10 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Dropdown Arrow (Optional for Styling) */}
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
              className="w-full appearance-none pl-10 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Dropdown Arrow (Optional for Styling) */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="event-form__section grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium mb-1">Queue capacity</label>
          <input id="capacity" type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label htmlFor="staffCount" className="block text-sm font-medium mb-1">Staff serving</label>
          <input id="staffCount" type="number" min="1" max="20" value={staffCount} onChange={(event) => setStaffCount(event.target.value)} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={allowAnonymousJoining} onChange={(event) => setAllowAnonymousJoining(event.target.checked)} />
          Allow attendees to join without an account
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={allowAutomaticSkips} onChange={(event) => setAllowAutomaticSkips(event.target.checked)} />
          Automatically advance the queue
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="event-form__submit w-full bg-emerald-600 hover:bg-emerald-700 font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-2 flex items-center justify-center gap-2"
      >
        {isEditing ? (
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
