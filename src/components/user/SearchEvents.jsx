import React, { useContext, useEffect, useState } from "react";
import {
  connection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn.js";
import { toast } from "react-toastify";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import EventCard from "../common/EventCard.jsx";
import { useDebounce } from "@uidotdev/usehooks";
import { eventsList } from "../../services/api/swiftlineService.js";
import PaginationControls from "../common/PaginationControl.jsx";
import GlobalSpinner from "../common/GlobalSpinner.jsx";
import { showToast } from "../../services/utils/ToastHelper.jsx";

export const SearchEvents = () => {
  const { userId } = useOutletContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue] = useState(true);
  const [lastEventJoined, setLastEventJoined] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const eventsPerPage = 3;

  const [searchParams, updateSearchParams] = useSearchParams();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { invokeWithLoading } = useSignalRWithLoading();

  const fetchEvents = async (page = 1, search = "") => {
    try {
      eventsList(page, eventsPerPage, search).then((response) => {
        setEvents(response.data.data.events);
        setTotalPages(response.data.data.totalPages);
        setIsUserInQueue(response.data.data.isUserInQueue);
        setLastEventJoined(response.data.data.lastEventJoined);
        setSelectedEventId(searchParams.get("eventId"));
      });
    } catch (error) {
      showToast.error("Failed to load events");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlEventId = searchParams.get("eventId");
    const urlSearchTerm = searchParams.get("search");
    if (urlEventId && urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      fetchEvents(1, urlSearchTerm);
    } else {
      fetchEvents(currentPage, debouncedSearchTerm);
    }
  }, [currentPage, debouncedSearchTerm]);

  // In your search page component
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const eventId = queryParams.get("eventId");

    if (eventId) {
      // Automatically join the queue if the user came from a QR code
      const event = events.find((e) => e.id.toString() === eventId);
      if (event) {
        joinQueue(event);
      }
    }
  }, [events]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      //window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    updateSearchParams({ search: e.target.value });
    setCurrentPage(1); // Reset to first page on new search
  };

  // Optimized joinQueue function with loading state
  const joinQueue = async (event) => {
    const userToken =
      localStorage.getItem("user") === "undefined"
        ? null
        : localStorage.getItem("user");
    // Get token from localStorage
    const token = userToken ? JSON.parse(userToken) : null;

    if (!userId || !token) {
      showToast.error("Please login or sign up to join a queue");
      localStorage.setItem("from", location.href)
      navigate("/auth", { state: { from: location.href } });
      return;
    }

    if (isUserInQueue) {
      showToast.error("You're already in a queue");
      return;
    }
    try {
      const res = await invokeWithLoading(
        connection,
        "JoinQueueGroup",
        event.id,
        JSON.parse(userId)
      );
      if (res === -1) {
        showToast.error(
          "Can't queue for an inactive event. Please check back later."
        );
        return;
      }
      showToast.success("Joined queue successfully");
      navigate("/myQueue");
    } catch (error) {
      console.log(error);
      showToast.error(
        "Error joining queue, kindly refresh this page. If this error persists, please try again later. Error:"+ error
      );
    }
  };

  const handleShare = (eventId, eventTitle) => {
    const searchUrl = `${
      window.location.origin
    }/search?eventId=${eventId}&search=${encodeURIComponent(eventTitle)}`;

    navigator.clipboard
      .writeText(searchUrl)
      .then(() => showToast.success("Event link copied!"))
      .catch(() => {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = searchUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          showToast.success("Link copied!");
        } catch (err) {
          console.log(err);
          showToast.error("Failed to copy link");
        }
        document.body.removeChild(textArea);
      });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold ">Search Events</h2>

        <div className="w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
          />
        </div>
      </div>

      {isLoading ? (
        <GlobalSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isUserInQueue={isUserInQueue}
                lastEventJoined={lastEventJoined == event.id}
                onShare={handleShare}
                onJoin={joinQueue}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {events.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          No events found matching your search
        </div>
      )}
    </div>
  );
};

export default SearchEvents;
