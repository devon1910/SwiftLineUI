import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchEventById } from "../../services/api/swiftlineService";
import { showToast } from "../../services/utils/ToastHelper";

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetchEventById(eventId);
        setEvent(response.data.data);
      } catch (err) {
        setError("Failed to load event details");
        showToast.error("Event not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error)
    return <div className="text-center py-12 text-red-500">{error}</div>;
  const handleShare = (eventId) => {
    const url = `${window.location.origin}/events/${eventId}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success("Link copied!"))
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success("Link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
    document.body.removeChild(textArea);
  };
  return (
    <div className="min-h-screen bg-sage-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-sage-600 hover:text-sage-700"
        >
          <FiArrowLeft className="mr-2" /> Back to My Events
        </button>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {/* Header Section */}
          <button
            onClick={() => handleShare(event.id)}
            className="w-full py-2 px-4 border border-sage-300 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:border-sage-500 hover:text-sage-500 dark:hover:bg-sage-900/10 transition-colors"
          >
            Share Event
          </button>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-2">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-600">{event.description}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <FiClock className="text-sage-600 mr-3 text-xl" />
                  <div>
                    <p className="font-medium">Start Time</p>
                    <p className="text-gray-600">
                      {new Date(event.eventStartTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiClock className="text-sage-600 mr-3 text-xl" />
                  <div>
                    <p className="font-medium">End Time</p>
                    <p className="text-gray-600">
                      {new Date(event.eventEndTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-1">
              <div className="bg-sage-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Event Details</h3>

                <div className="flex items-center mb-4">
                  <FiUsers className="text-sage-600 mr-3" />
                  <span className="text-gray-600">
                    {event.usersInQueue} attendees
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-medium mb-1">Organizer</p>
                  <p className="text-gray-600">{event.swiftLineUser.username}</p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/queueManagement`, { state: { event } })
                  }
                  className="w-full py-2 px-4 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                >
                  Manage Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;
