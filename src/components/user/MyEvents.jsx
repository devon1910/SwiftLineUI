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
} from "lucide-react";
import EventQRCode from "../common/EventQRCode";
import { showToast } from "../../services/utils/ToastHelper";
import { Copy, Eye, Share } from "react-bootstrap-icons";
import { format } from "date-fns";

const MyEvents = () => {
  const [userEvents, setUserEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUserEvents();
  }, []);

  const { userId, userName, setShowAuthModal } = useOutletContext();

  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
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
    // Implement delete event logic here
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
        setUserEvents(response.data.data);
      })
      .catch((error) => {
        setShowAuthModal("login");
        console.log(error);
      });
  }
  return (
    <div className="min-h-screen bg-sage-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Events
          </h2>
          <button
            onClick={() => handleNavigation()}
            className="bg-sage-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-sage-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
          >
            Create New Event
          </button>
        </div>

        {/* Events Grid */}
        {userEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="bg-sage-50 border-l-4 border-sage-300 text-sage-700 p-6 rounded-lg mt-8">
              No events created yet. 📅
            </p>
          </div>
        )}

        {userEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvents.map((event) => (
              <div class="relative border rounded-lg shadow-md p-6">
                {/* Delete Button (Subtler) */}
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 rounded-full p-1 transition-colors"
                  aria-label="Delete event"
                >
                  <FiTrash2 class="w-5 h-5" />
                </button>

                {/* Title and Description */}
                <h3 class="text-xl font-semibold dark:text-white mb-2">
                  {event.title}
                </h3>
                <p class="mb-4">{event.description}</p>

                {/* Main Action Button */}
                <button
                  onClick={() =>
                    navigate("/queueManagement", { state: { event: event } })
                  }
                  className="w-full py-2 px-4 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye class="w-5 h-5" />
                  <span>View Queue</span>
                </button>

                {/* Secondary Actions (as icons or in a dropdown) */}
                <div class="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleShare(event.title)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-sage-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Share event"
                  >
                    <CopyIcon class="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      navigate("/newEvent", { state: { editingEvent: event } })
                    }
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-sage-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Edit event"
                  >
                    <Edit class="w-5 h-5" />
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
                <div class="absolute bottom-3 left-3 text-gray-500 text-sm">
                  <div className="flex items-center gap-1">
                    <BadgePlus className="w-4 h-4" />
                    Created on: {format(new Date(event.createdAt), "dd/MM/yyyy")}
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
