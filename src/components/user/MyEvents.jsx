import React, { use, useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { UserEvents } from "../../services/swiftlineService";
import { FiTrash2 } from "react-icons/fi";
import { deleteEvent } from "../../services/swiftlineService";
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from "react-router-dom";

const MyEvents = () => {
  const [userEvents, setUserEvents] = useState([]);
  const navigator = useNavigate();
  useEffect(() => {
    getUserEvents();
  }, []);
  const {  userId } = useOutletContext();
  function handleNavigation()
  {
     if (!userId) {
          toast.error("Please login or signup to join a queue.");
          navigator("/login");
          return;
        }
      navigator("/newEvent")
  }

  function handleDeleteEvent(eventId) {
    // Implement delete event logic here
    const answer = confirm("Are you sure you want to delete this event?");
    if (answer) {
      deleteEvent(eventId)
        .then((response) => {
          toast.success("Event deleted successfully.");
          getUserEvents();
        })
        .catch((error) => {
          toast.success("Unable to delete event, Please try again later..");
          console.log(error);
        });
    }
  }

  function getUserEvents() {
    UserEvents()
      .then((response) => {
        setUserEvents(response.data.data);
      })
      .catch((error) => {
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
        {userEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No events created yet. Start by creating your first event!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEvents.map((event) => (
              <div
                key={event.id}
                className="relative  rounded-xl shadow-md border border-sage-200 dark:border-gray-700"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Delete event"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>

                <div className="p-6 flex flex-col gap-4">
                  {/* Title */}
                  <h3 className="text-xl  font-semibold text-gray-900 dark:text-gray-100 pr-6">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="dark:text-gray-500 text-sm leading-relaxed">
                    {event.description}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => onPageChange("queueManagement", event)}
                      className="w-full py-2 px-4 border border-sage-500 text-sage-500 rounded-lg font-medium hover:bg-sage-50 dark:hover:bg-sage-900/20 transition-colors"
                    >
                      View Queue
                    </button>
                    <button
                      onClick={() => onPageChange("eventForm", event)}
                      className="w-full py-2 px-4 border border-sage-300 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:border-sage-500 hover:text-sage-500 dark:hover:bg-sage-900/10 transition-colors"
                    >
                      Edit Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyEvents;
