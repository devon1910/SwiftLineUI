import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { connection } from "../../services/SignalRConn.js";
import LoadingSpinner from "../LoadingSpinner";
import { GetUserQueueStatus } from "../../services/swiftlineService";
import { toast } from "react-toastify";
import { FiCalendar, FiClock, FiUser, FiUsers } from "react-icons/fi";

export const SearchEvents = ({ events, onPageChange, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue] = useState(true);
  // const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  // Pagination logic
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  useEffect(() => {
    getUserQueueStatus();
    //setIsLoading(false);
  }, []);

  function getUserQueueStatus() {
    GetUserQueueStatus()
      .then((response) => {
        setIsUserInQueue(response.data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        console.log(error);
      });
  }

  const joinQueue = async (event) => {
    const eventId = event.id;

    // Reconnect if SignalR connection is lost
    if (connection.state !== "Connected") {
      toast.info("Connection lost. Attempting to reconnect...");
      try {
        await connection.start();
        toast.success("Reconnected successfully.");
      } catch (reconnectError) {
        console.error("Reconnection failed:", reconnectError);
        toast.error("Unable to reconnect. Please check your network.");
        return;
      }
    }

    // Invoke SignalR method to join the queue
    connection
      .invoke("JoinQueueGroup", eventId, userId)
      .then(() => {
        toast.success("Joined queue successfully.");
        onPageChange("myqueue");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error joining queue. Please try again.");
      });
  };

  // if (isLoading) {
  //   return <LoadingSpinner message="Loading..." />;
  // }
  // const StatItem = ({ label, value }) => (
  //   <div className="flex flex-col">
  //     <span className="text-xs text-black text-sage-500 dark:text-sage-400 font-medium">{label}</span>
  //     <span className="text-gray-600 text-black dark:text-gray-600 font-medium">{value}</span>
  //   </div>

  // Update StatItem component to include icons
  const StatItem = ({ label, value }) => {
    let icon = null;

    switch (label) {
      case "Average Wait":
        icon = (
          <FiClock className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      case "Users in Queue":
        icon = (
          <FiUsers className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      case "Start Time":
        icon = (
          <FiCalendar className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      case "End Time":
        icon = (
          <FiCalendar className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-1" />
        );
        break;
      default:
        icon = null;
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          {icon}
          <span className="text-xs text-sage-500 dark:text-sage-400 font-medium">
            {label}
          </span>
        </div>
        <span className=" font-medium">
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Search Events
      </h2>

      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search events by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-green-500 dark:bg-white-800 dark:border-gray-600"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className="relative rounded-xl shadow-md border border-sage-200 dark:border-gray-700"
          >
            {/* Status Dot */}
            <div
              className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                event.isActive ? "bg-sage-500" : "bg-sage-200"
              }`}
            />

            <div className="p-6 flex flex-col gap-4">
              {/* Title */}
              <h3 className="text-xl  font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </h3>

              {/* Description */}
              <p className=" text-sm leading-relaxed">
                {event.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatItem
                  label="Average Wait"
                  value={`${event.averageTime} mins`}
                />
                <StatItem label="Users in Queue" value={event.usersInQueue} />
                <StatItem label="Start Time" value={event.eventStartTime} />
                <StatItem label="End Time" value={event.eventEndTime} />
              </div>

              {/* Organizer */}
              <p className="text-sm text-sage-500 dark:text-sage-400 italic flex items-center">
                <FiUser className="w-4 h-4 mr-1 text-sage-500 dark:text-sage-400" />
                Organized by: {event.createdBy}
              </p>

              {/* Join Button */}
              <button
                disabled={isUserInQueue}
                onClick={() => joinQueue(event)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  isUserInQueue
                    ? "bg-sage-200 text-sage-600 cursor-not-allowed"
                    : "bg-sage-500 text-white hover:bg-sage-600 hover:shadow-md"
                }`}
              >
                {isUserInQueue ? "Already in a Queue" : "Join Queue"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? "bg-sage-500 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-sage-100 dark:hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchEvents;
