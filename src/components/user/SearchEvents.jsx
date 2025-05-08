import React, { useContext, useEffect, useState } from "react";
import {
  connection,
  ensureConnection,
  useSignalRWithLoading,
} from "../../services/api/SignalRConn.js";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import EventCard from "../common/EventCard.jsx";
import { useDebounce } from "@uidotdev/usehooks";
import PaginationControls from "../common/PaginationControl.jsx";
import GlobalSpinner from "../common/GlobalSpinner.jsx";
import { showToast } from "../../services/utils/ToastHelper.jsx";
import {  saveAuthTokensFromSignalR } from "../../services/utils/authUtils.js";
import { eventsList } from "../../services/api/swiftlineService.js";

export const SearchEvents = () => {
  let  userId  = localStorage.getItem("userId") || null;
  const { userName, setShowAuthModal } = useOutletContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue] = useState(true);
  const [lastEventJoined, setLastEventJoined] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false); // New state for reconnecting
  const [isCreatingAccount, setIsCreatingAccount] = useState(false); // New state for creating account
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
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      fetchEvents(1, urlSearchTerm);
    } else {
      fetchEvents(currentPage, debouncedSearchTerm);
    }

    // if(userId && localStorage.getItem("user")) {
    // startSignalRConnection(navigate);
    // }
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

    // if (!userId || !token) {
    //   if(event.allowAnonymousJoining){
    //     //create User
    //     setIsCreatingAccount(true); // Show loading indicator
    //     await CreateAnonymousUser().then((response) => {
    //       saveAuthTokens(response);
    //       setIsCreatingAccount(false); // Hide loading indicator
    //     }).catch(() => {
    //       setIsCreatingAccount(false); // Hide loading indicator
    //     });
    //   }else{
    //     showToast.error("Please login or sign up to join a queue");
    //     localStorage.setItem("from", location.href);
    //     setShowAuthModal("login");
    //     return;
    //   }
      
    // }
    if(!userId && !event.allowAnonymousJoining){
      showToast.error("The Event Organizer has disabled anonymous joining. Please login or sign up to join this queue");
      setShowAuthModal("login");
      return;
    }
    if (isUserInQueue) {
      showToast.error("You're already in a queue");
      return;
    }
    const joinQueueLogic = async () => {
      try {
        setIsReconnecting(true); // Show loading indicator
        await ensureConnection();
        const res = await invokeWithLoading(
          connection,
          "JoinQueueGroup",
          event.id,
          JSON.parse(userId)
        );
        if(!userId) saveAuthTokensFromSignalR(res);

        if(!res.status){
          showToast.error(res.message);
          return
        }
        showToast.success("Joined queue successfully");
        localStorage.setItem("showFeedbackForm", true);
        navigate("/myQueue");
      } catch (error) {
        console.log(error);
      } finally {
        setIsReconnecting(false); // Hide loading indicator
      }
    }

    if (!event.isActive) {
      const confirmValue = confirm(
        "This event has been paused by the Organizer. The estimated wait time in queue would start counting once the event is resumed. Do you want to continue?"
      );
      if (confirmValue) {
        joinQueueLogic();
      }
    } 
    else {
      joinQueueLogic();
    }
  };

  const handleShare = (eventTitle) => {
    const searchUrl = `${
      window.location.origin
    }/search?search=${encodeURIComponent(eventTitle)}`;

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
        }
        document.body.removeChild(textArea);
      });
  };

  return (
    
    <div className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto ${isReconnecting ? 'opacity-50 pointer-events-none' : ''}`}>
      {isReconnecting && <GlobalSpinner />} {/* Show spinner during reconnection */}
      {isCreatingAccount && <GlobalSpinner />} {/* Show spinner during account creation */}
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
