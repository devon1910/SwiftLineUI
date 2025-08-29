import React, { useState, useEffect, useRef } from "react";
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
  FiPlay,
  FiPause,
  FiMapPin,
  FiTarget,
} from "react-icons/fi";
import { LoaderCircle, LockKeyholeOpen } from "lucide-react";
import { useTheme } from "../../services/utils/useTheme";
import { ArrowReturnLeft } from "react-bootstrap-icons";
import { showToast } from "../../services/utils/ToastHelper";

const EventForm = () => {
  const location = useLocation();
  const navigator = useNavigate();
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

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
    editingEvent ? editingEvent.capacity : 10
  );
  const [allowAnonymous, setAllowAnonymous] = useState(
    editingEvent ? editingEvent.allowAnonymousJoining : false
  );

  const [allowAutomaticSkips, setAllowAutomaticSkips] = useState(
    editingEvent ? editingEvent.allowAutomaticSkips : true
  );

  // New geographic restriction states
  const [enableGeographicRestriction, setEnableGeographicRestriction] =
    useState(
      editingEvent ? editingEvent.enableGeographicRestriction || false : false
    );
  const [eventLocation, setEventLocation] = useState(
    editingEvent ? editingEvent.address || "" : ""
  );
  const [eventLatitude, setEventLatitude] = useState(
    editingEvent ? editingEvent.latitude || null : null
  );
  const [eventLongitude, setEventLongitude] = useState(
    editingEvent ? editingEvent.longitude || null : null
  );
  const [radiusInMeters, setRadiusInMeters] = useState(
    editingEvent ? editingEvent.radiusInMeters || 100 : 100
  );

  const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);
  // Load Google Maps API
  useEffect(() => {
    if (enableGeographicRestriction && !window.google && !editingEvent) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_CLIENT_KEY
      }&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      const checkApiReady = () => {
        if (window.google?.maps?.importLibrary) {
          setIsMapApiLoaded(true);
        } else {
          // Check again after a short delay
          setTimeout(checkApiReady, 100);
        }
      };

      script.onload = () => {
        checkApiReady();
      };

      script.onerror = () => {
        toast.error(
          "Failed to load Google Maps. Please check your API key and internet connection."
        );
      };
    }
  }, [enableGeographicRestriction, editingEvent]);

  // Initialize Google Places Autocomplete with new API
  useEffect(() => {
    const initMap = async () => {
      if (
        enableGeographicRestriction &&
        isMapApiLoaded &&
        locationInputRef.current &&
        !editingEvent
      ) {
        try {
          // Request needed libraries
          await window.google.maps.importLibrary("places");

          // Create the PlaceAutocompleteElement
          const placeAutocomplete =
            new window.google.maps.places.PlaceAutocompleteElement();
          placeAutocomplete.id = "place-autocomplete";
          // placeAutocomplete.setComponentRestrictions({ country: ['ng'] });
          // Style the autocomplete element to match your design
          //   placeAutocomplete.style.width = '100%';
          //   placeAutocomplete.style.height = '42px';
          placeAutocomplete.style.borderRadius = "0.5rem";
          placeAutocomplete.style.border = darkMode
            ? "1px solid #6b7280"
            : "1px solid #d1d5db";
          placeAutocomplete.style.backgroundColor = "#6B7D6B";
          //placeAutocomplete.style.color = darkMode ? '#ffffff !important' : '#111827 !important';
          //   placeAutocomplete.style.paddingLeft = '2.5rem';
          //   placeAutocomplete.style.fontSize = '14px';
          //   placeAutocomplete.placeholder = 'Search for event location...';

          // Clear the container and add the new element
          if (locationInputRef.current) {
            locationInputRef.current.innerHTML = "";
            locationInputRef.current.appendChild(placeAutocomplete);
          }

          // Add the place select listener
          placeAutocomplete.addEventListener(
            "gmp-select",
            async ({ placePrediction }) => {
              try {
                const place = placePrediction.toPlace();
                await place.fetchFields({
                  fields: ["displayName", "formattedAddress", "location"],
                });

                const placeData = place.toJSON();
                const lat = placeData.location?.lat;
                const lng = placeData.location?.lng;

                if (lat && lng) {
                  setEventLocation(
                    placeData.formattedAddress || placeData.displayName
                  );
                  setEventLatitude(lat);
                  setEventLongitude(lng);
                }
              } catch (error) {
                console.error("Error fetching place details:", error);
                toast.error("Error loading place details. Please try again.");
              }
            }
          );

          autocompleteRef.current = placeAutocomplete;
        } catch (error) {
          console.error("Error initializing Places API:", error);
          toast.error(
            "Failed to initialize location search. Please refresh the page."
          );
        }
      }
    };

    initMap();

    return () => {
      if (autocompleteRef.current && locationInputRef.current) {
        locationInputRef.current.innerHTML = "";
      }
    };
  }, [enableGeographicRestriction, darkMode, isMapApiLoaded, editingEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventId = editingEvent ? editingEvent.id : 0;
    if (validateEventStartEnd() && validateGeographicSettings()) {
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
        allowAutomaticSkips,
        enableGeographicRestriction,
        address: enableGeographicRestriction ? eventLocation : null,
        Latitude: enableGeographicRestriction ? eventLatitude : null,
        Longitude: enableGeographicRestriction ? eventLongitude : null,
        radiusInMeters: enableGeographicRestriction ? radiusInMeters : null,
      };

      if (editingEvent) {
        updateEvent(newEvent)
          .then(() => {
            toast.success("Event updated successfully!");
            navigator("/myEvents");
          })
          .catch((error) => {
            console.error("Error updating event:", error);
            toast.error(
              "There was an error updating the event. Please try again later."
            );
          });
      } else {

        if(enableGeographicRestriction){
          if (!eventLocation || !eventLatitude || !eventLongitude) {
            showToast.error(
              "Please select a valid location for geographic restrictions."
            );
            return;
          }

        }
        createEvent(newEvent)
          .then(() => {
            toast.success("Event created successfully!");
            navigator("/myEvents");
          })
          .catch((error) => {
            console.error("Error creating event:", error);
            toast.error(
              "There was an error creating the event. Please try again later."
            );
          });
      }
    }
  };

  const validateGeographicSettings = () => {
    if (enableGeographicRestriction) {
      if (!eventLocation || !eventLatitude || !eventLongitude) {
        toast.error(
          "Please select a valid location for geographic restrictions."
        );
        return false;
      }
      if (radiusInMeters < 10 || radiusInMeters > 10000) {
        toast.error("Radius must be between 10 and 10,000 meters.");
        return false;
      }
    }
    return true;
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

  const validateEventStartEnd = () => {
    if (!eventStartTime || !eventEndTime) {
      toast.error("Please select both start and end times.");
      return false;
    }
    return true;
  };

  const formatRadiusText = (radius) => {
    if (radius >= 1000) {
      return `${(radius / 1000).toFixed(1)} km`;
    }
    return `${radius} m`;
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
            ${
              darkMode
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
          aria-label="Go back to My Events"
        >
          <ArrowReturnLeft className="w-6 h-6" />
        </button>
        <h3
          className={`text-2xl sm:text-3xl font-bold flex items-center gap-3
          ${darkMode ? "text-white" : "text-gray-900"}
        `}
        >
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
        <label
          htmlFor="eventTitle"
          className={`block text-sm font-medium mb-2 ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
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
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
              }
              ${editingEvent ? "opacity-70 cursor-not-allowed" : ""}
            `}
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <label
          htmlFor="eventDescription"
          className={`block text-sm font-medium mb-2 ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="eventDescription"
            rows={4}
            maxLength={300}
            placeholder="Describe your event details, purpose, or what attendees can expect..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={`w-full pl-4 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200 resize-y
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
              }
            `}
          />
        </div>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {/* Average Wait Time */}
        <div className="relative">
          <label
            htmlFor="averageTime"
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
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
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                }
              `}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>
        {/* Number of Staff */}
        <div className="relative">
          <label
            htmlFor="staffCount"
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
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
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                }
              `}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>
        {/* Capacity */}
        <div className="relative">
          <label
            htmlFor="capacityCount"
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Queue Capacity (Min) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="capacityCount"
              type="number"
              placeholder=""
              min="10"
              max="1000"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                }
              `}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>
      </div>

      {/* Time Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Start Time */}
        <div className="relative">
          <label
            htmlFor="startTime"
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Start Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="startTime"
              value={eventStartTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        {/* End Time */}
        <div className="relative">
          <label
            htmlFor="endTime"
            className={`block text-sm font-medium mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            End Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="endTime"
              value={eventEndTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
                ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Restriction Toggle */}
      <div
        className={`mb-6 p-4 rounded-lg border flex items-center justify-between transition-colors duration-300
        ${darkMode ? "bg-gray-700 shadow-inner" : "bg-gray-100 shadow-sm"}
      `}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              setEnableGeographicRestriction(!enableGeographicRestriction)
            }
            className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2
              ${
                darkMode
                  ? "focus:ring-offset-gray-700"
                  : "focus:ring-offset-gray-100"
              }
              ${
                enableGeographicRestriction
                  ? "bg-sage-700"
                  : darkMode
                  ? "bg-gray-900"
                  : "bg-gray-400"
              }
            `}
            aria-checked={enableGeographicRestriction}
            role="switch"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
                ${
                  enableGeographicRestriction
                    ? "translate-x-6 bg-white"
                    : "translate-x-0 bg-white"
                }
              `}
            >
              <FiMapPin
                className={`w-4 h-4 ${
                  enableGeographicRestriction
                    ? "text-sage-500"
                    : "text-gray-500"
                }`}
              />
            </span>
          </button>
          <div className="flex flex-col">
            <span
              className={`text-base font-medium ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {enableGeographicRestriction
                ? "Location-Based Queue"
                : "Open Location Queue"}
            </span>
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {enableGeographicRestriction
                ? "Users must be nearby to join"
                : "No location restrictions"}
            </span>
          </div>
        </div>
        <div className="relative group flex-shrink-0">
          <FiInfo
            className={`w-5 h-5 cursor-pointer transition-colors duration-200
            ${
              darkMode
                ? "text-gray-400 hover:text-sage-400"
                : "text-gray-500 hover:text-sage-600"
            }
          `}
          />
          <div
            className={`
            absolute hidden group-hover:block w-60 p-3 text-sm rounded-lg bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 shadow-lg
            ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-800 text-white"}
          `}
          >
            {enableGeographicRestriction
              ? "Users can only join the queue if they're within the specified distance from your event location"
              : "Anyone can join the queue regardless of their location"}
            <div
              className={`absolute w-3 h-3 rotate-45 -bottom-1 left-1/2 -translate-x-1/2
              ${darkMode ? "bg-gray-700" : "bg-gray-800"}
            `}
            ></div>
          </div>
        </div>
      </div>

      {/* Geographic Restriction Settings */}
      {enableGeographicRestriction && (
        <div
          className={`mb-6 p-4 rounded-lg border transition-all duration-300 space-y-4
          ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-300"
          }
        `}
        >
          <h4
            className={`text-lg font-semibold flex items-center gap-2
            ${darkMode ? "text-gray-100" : "text-gray-800"}
          `}
          >
            <FiTarget className="w-5 h-5 text-sage-500" />
            Location Settings
          </h4>

          {/* Event Location Input */}
          <div className="space-y-2">
            <label
              htmlFor="eventLocation"
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Event Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                ref={locationInputRef}
                className={`w-full min-h-[42px] border rounded-lg focus-within:ring-2 focus-within:ring-sage-500 focus-within:border-sage-500 transition duration-200 relative
                  ${
                    darkMode
                      ? "bg-gray-600 border-gray-500"
                      : "bg-white border-gray-300"
                  }
                `}
              >
                {/* Placeholder div when Google Maps isn't loaded yet */}
                {(!isMapApiLoaded || editingEvent) && (
                  <input
                    type="text"
                    placeholder="Loading location search..."
                    disabled
                    value={eventLocation}
                    className={`w-full pl-10 pr-3 py-2 border-0 rounded-lg bg-transparent focus:outline-none
                      ${darkMode ? "text-gray-400" : "text-gray-500"}
                    `}
                  />
                )}
              </div>
            </div>
            {eventLocation && !editingEvent && (
              <div
                className={`text-sm flex items-center gap-2 ${
                  darkMode ? "text-sage-400" : "text-sage-600"
                }`}
              >
                <FiCheck className="w-4 h-4" />
                <span>Selected: {eventLocation}</span>
              </div>
            )}
          </div>

          {/* Distance Radius Input */}
          <div className="space-y-2">
            <label
              htmlFor="radiusInMeters"
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Maximum Distance <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[10, 100, 500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRadiusInMeters(val)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition
          ${
            radiusInMeters === val
              ? darkMode
                ? "bg-sage-600 text-white"
                : "bg-sage-200 text-sage-900"
              : darkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-400"
              : "bg-gray-300 text-gray-600 hover:bg-gray-200"
          }`}
                  >
                    {val >= 1000 ? `${val / 1000} km` : `${val} m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allow Anonymous Joining Toggle */}
      <div
        className={`mb-8 p-4 rounded-lg border flex items-center justify-between transition-colors duration-300
        ${darkMode ? "bg-gray-700 shadow-inner" : "bg-gray-100 shadow-sm"}
      `}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAllowAnonymous(!allowAnonymous)}
            className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2
              ${
                darkMode
                  ? "focus:ring-offset-gray-700"
                  : "focus:ring-offset-gray-100"
              }
              ${
                allowAnonymous
                  ? "bg-sage-700"
                  : darkMode
                  ? "bg-gray-900"
                  : "bg-gray-400"
              }
            `}
            aria-checked={allowAnonymous}
            role="switch"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
                ${
                  allowAnonymous
                    ? "translate-x-6 bg-white"
                    : "translate-x-0 bg-white"
                }
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
            <span
              className={`text-base font-medium ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {allowAnonymous ? "Allow Anonymous Joining" : "Require Account"}
            </span>
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {allowAnonymous
                ? "Guests can join without an account"
                : "Requires account to join"}
            </span>
          </div>
        </div>
        <div className="relative group flex-shrink-0">
          <FiInfo
            className={`w-5 h-5 cursor-pointer transition-colors duration-200
            ${
              darkMode
                ? "text-gray-400 hover:text-sage-400"
                : "text-gray-500 hover:text-sage-600"
            }
          `}
          />
          <div
            className={`
            absolute hidden group-hover:block w-56 p-3 text-sm rounded-lg bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 shadow-lg
            ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-800 text-white"}
          `}
          >
            {allowAnonymous
              ? "Anyone can join queue without an account"
              : "Requires account creation to join queue"}
            <div
              className={`absolute w-3 h-3 rotate-45 -bottom-1 left-1/2 -translate-x-1/2
              ${darkMode ? "bg-gray-700" : "bg-gray-800"}
            `}
            ></div>
          </div>
        </div>
      </div>

      {/* Allow Automatic Skips Toggle */}
      <div
        className={`mb-8 p-4 rounded-lg border flex items-center justify-between transition-colors duration-300
        ${darkMode ? "bg-gray-700 shadow-inner" : "bg-gray-100 shadow-sm"}
      `}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAllowAutomaticSkips(!allowAutomaticSkips)}
            className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2
              ${
                darkMode
                  ? "focus:ring-offset-gray-700"
                  : "focus:ring-offset-gray-100"
              }
              ${
                allowAutomaticSkips
                  ? "bg-sage-700"
                  : darkMode
                  ? "bg-gray-900"
                  : "bg-gray-400"
              }
            `}
            aria-checked={allowAutomaticSkips}
            role="switch"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
                ${
                  allowAutomaticSkips
                    ? "translate-x-6 bg-white"
                    : "translate-x-0 bg-white"
                }
              `}
            >
              {allowAutomaticSkips ? (
                <FiPlay className="w-4 h-4 text-sage-500" />
              ) : (
                <FiPause className="w-4 h-4 text-gray-500" />
              )}
            </span>
          </button>
          <div className="flex flex-col">
            <span
              className={`text-base font-medium ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {allowAutomaticSkips
                ? "Automatic Queue Processing"
                : "Manual Queue Processing"}
            </span>
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {allowAutomaticSkips
                ? "System automatically moves to next person"
                : "Manually mark users as served"}
            </span>
          </div>
        </div>
        <div className="relative group flex-shrink-0">
          <FiInfo
            className={`w-5 h-5 cursor-pointer transition-colors duration-200
            ${
              darkMode
                ? "text-gray-400 hover:text-sage-400"
                : "text-gray-500 hover:text-sage-600"
            }
          `}
          />
          <div
            className={`
            absolute hidden group-hover:block w-56 p-3 text-sm rounded-lg bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 shadow-lg
            ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-800 text-white"}
          `}
          >
            {allowAutomaticSkips
              ? "Queue automatically advances after a set time period or when service is complete"
              : "Queue administrator must manually mark each person as served before advancing"}
            <div
              className={`absolute w-3 h-3 rotate-45 -bottom-1 left-1/2 -translate-x-1/2
              ${darkMode ? "bg-gray-700" : "bg-gray-800"}
            `}
            ></div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6 flex items-center justify-center gap-2
          ${
            darkMode
              ? "bg-sage-600 hover:bg-sage-700 focus:ring-sage-500 focus:ring-offset-gray-800 shadow-md hover:shadow-lg"
              : "bg-sage-500 hover:bg-sage-600 focus:ring-sage-500 focus:ring-offset-white shadow-md hover:shadow-lg"
          }
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
