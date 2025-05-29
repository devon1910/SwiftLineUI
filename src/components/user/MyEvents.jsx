import React, { useEffect, useState } from "react";
import { UserEvents } from "../../services/api/swiftlineService";
import { FiTrash2 } from "react-icons/fi";
import { deleteEvent } from "../../services/api/swiftlineService";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  BadgePlus,
  CopyIcon,
  Edit,
  QrCode,
  QrCodeIcon,
  Share2Icon,
  BarChart2, // Import for a chart icon
} from "lucide-react";
import EventQRCode from "../common/EventQRCode";
import { showToast } from "../../services/utils/ToastHelper";
import { Copy, Eye, Share } from "react-bootstrap-icons";
import { format } from "date-fns";
import StackedBarChart from "./StackedBarChart";

const MyEvents = () => {
  const [userEvents, setUserEvents] = useState([]);
  const navigate = useNavigate();
  
  const { userId, userName, setShowAuthModal } = useOutletContext();

  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [EventComparisonData, setEventComparisonData] = useState(null);
  const [showEventsAnalytics, setShowEventsAnalytics] = useState(false);

  useEffect(() => {
    getUserEvents();
  }, []);


  function handleNavigation() {
    if (
      !userId ||
      userName == "" ||
      userName == null ||
      userName == undefined ||
      userName == "Anonymous"
    ) {
      showToast.error("Please login or signup to create an event.");
      //navigate("/auth");
      setShowAuthModal("login");
      return;
    }
    navigate("/newEvent");
  }

  function handleDeleteEvent(eventId) {
    const answer = confirm("Are you sure you want to delete this event?");
    if (answer) {
      deleteEvent(eventId)
        .then(() => {
          toast.success("Event deleted successfully.");
          getUserEvents();
        })
        .catch((error) => {
          toast.success("Unable to delete event, Please try again later..");
          console.log(error);
        });
    }
  }

  const handleShare = (eventTitle) => {
    const searchUrl = `${
      window.location.origin
    }/search?search=${encodeURIComponent(eventTitle)}`;

    navigator.clipboard
      .writeText(searchUrl)
      .then(() => toast.success("Event link copied!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  function getUserEvents() {
    if (
      !userId ||
      userName == "" ||
      userName == null ||
      userName == undefined ||
      userName == "Anonymous"
    ) {
      return;
    }
    UserEvents()
      .then((response) => {
        setUserEvents(response.data.data.events);
        setEventComparisonData(response.data.data.eventComparisonData);
      })
      .catch((error) => {
        setShowAuthModal("login");
        console.log(error);
      });
  }

  // New function to navigate to the analytics dashboard
  const handleViewAnalytics = () => {
    setShowEventsAnalytics(!showEventsAnalytics) // Adjust this route to your analytics dashboard route
  };

  
  return (
    <div className="min-h-screen bg-sage-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            My Events
          </h2>
          <div className="flex gap-3"> {/* Container for buttons */}
            {userEvents.length > 0 && (
              <button
                onClick={handleViewAnalytics}
                className="text-white px-6 py-2 rounded-lg font-medium  flex items-center gap-2"
              >
                <BarChart2 className="w-5 h-5" />
                <span>{showEventsAnalytics ? "Hide Event Insights" : "Show Event Insights"}</span>
              </button>
            )}
            <button
              onClick={() => handleNavigation()}
              className="bg-sage-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-sage-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
            >
              Create New Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {userEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="border-l-4 border-sage-300 text-sage-700 p-6 rounded-lg mt-8">
              No events created yet. 📅
            </p>
          </div>
        )}

        {userEvents.length > 0 ? !showEventsAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvents.map((event) => (
              <div key={event.id} className="relative border rounded-lg shadow-md p-6"> {/* Changed class to className */}
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 rounded-full p-1 transition-colors"
                  aria-label="Delete event"
                >
                  <FiTrash2 className="w-5 h-5" /> {/* Changed class to className */}
                </button>

                {/* Title and Description */}
                <h3 className="text-xl font-semibold dark:text-white mb-2"> {/* Changed class to className */}
                  {event.title}
                </h3>
                <p className="mb-4">{event.description}</p> {/* Changed class to className */}

                {/* Main Action Button */}
                <button
                  onClick={() =>
                    navigate("/queueManagement", { state: { event: event } })
                  }
                  className="w-full py-2 px-4 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" /> {/* Changed class to className */}
                  <span>View Queue</span>
                </button>

                {/* Secondary Actions (as icons or in a dropdown) */}
                <div className="flex justify-end gap-2 mt-4"> {/* Changed class to className */}
                  <button
                    onClick={() => handleShare(event.title)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-sage-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Share event"
                  >
                    <CopyIcon className="w-5 h-5" /> {/* Changed class to className */}
                  </button>
                  <button
                    onClick={() =>
                      navigate("/newEvent", { state: { editingEvent: event } })
                    }
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-sage-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Edit event"
                  >
                    <Edit className="w-5 h-5" /> {/* Changed class to className */}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowQRCode(true);
                    }}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-sage-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Get QR Code"
                  >
                    <QrCodeIcon />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 text-gray-500 text-sm"> {/* Changed class to className */}
                  <div className="flex items-center gap-1 mt-2">
                    <BadgePlus className="w-4 h-4" />
                    Created on: {format(new Date(event.createdAt), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ):(
          <StackedBarChart EventComparisonData={EventComparisonData}/>
        ): (<></>)}
      </div>
      {showQRCode && selectedEvent && (
        <EventQRCode
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};

export default MyEvents;