<<<<<<< HEAD
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
import { saveAuthTokensFromSignalR } from "../../services/utils/authUtils.js";
import { eventsList } from "../../services/api/swiftlineService.js";

export const SearchEvents = () => {
  let userId = localStorage.getItem("userId") || null;
  const { userName, setShowAuthModal } = useOutletContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue] = useState(false);
  const [lastEventJoined, setLastEventJoined] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false); // New state for reconnecting
  const [isCreatingAccount, setIsCreatingAccount] = useState(false); // New state for creating account
  const eventsPerPage = 6;
=======
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import EventCard from "../EventCard.jsx";
import PaginationControls from "../PaginationControl.jsx";
import {
  connection,
  ensureSignalRConnected,
  useSignalRWithLoading,
} from "../../services/SignalRConn.js";
import { eventsList } from "../../services/swiftlineService";
import { storeAuthTokens } from "../../services/authStorage";

const EVENTS_PER_PAGE = 6;

const EventCardSkeleton = () => (
  <div
    className="h-full rounded-2xl border border-sage-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
    aria-hidden="true"
  >
    <div className="animate-pulse space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <div className="h-5 w-24 rounded-full bg-sage-100 dark:bg-gray-700" />
          <div className="h-6 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
        </div>
        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-700" />
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/60">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-2 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
      <div className="h-12 rounded-xl bg-sage-100 dark:bg-gray-700" />
      <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-700" />
    </div>
  </div>
);

export const SearchEvents = () => {
  const { userId } = useOutletContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue] = useState(null);
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)

  const [searchParams, updateSearchParams] = useSearchParams();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { invokeWithLoading } = useSignalRWithLoading();
  const latestRequestRef = useRef(0);
  const joinInFlightRef = useRef(false);

  const linkedSearchTerm = searchParams.get("eventId")
    ? searchParams.get("search") ?? ""
    : null;
  const requestSearch = linkedSearchTerm ?? debouncedSearchTerm;
  const requestPage = linkedSearchTerm !== null ? 1 : currentPage;

  const fetchEvents = useCallback(async (page, search) => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setIsLoading(true);
    setError("");

<<<<<<< HEAD
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
=======
    try {
      const response = await eventsList(page, EVENTS_PER_PAGE, search);
      if (requestId !== latestRequestRef.current) return;

      const payload = response?.data?.data ?? {};
      setEvents(Array.isArray(payload.events) ? payload.events : []);
      setTotalPages(Math.max(Number(payload.totalPages) || 1, 1));
      setIsUserInQueue(
        typeof payload.isUserInQueue === "boolean" ? payload.isUserInQueue : false
      );
    } catch (requestError) {
      if (requestId !== latestRequestRef.current) return;
      setError("We couldn't load events right now. Please try again.");
      setEvents([]);
      setTotalPages(1);
      setIsUserInQueue(false);
      console.error("Failed to load events", requestError);
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
    } finally {
      if (requestId === latestRequestRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      fetchEvents(1, urlSearchTerm);
    } else {
      fetchEvents(currentPage, debouncedSearchTerm);
=======
    const sharedSearchTerm = searchParams.get("search");
    if (
      searchParams.get("eventId") &&
      sharedSearchTerm !== null &&
      sharedSearchTerm !== searchTerm
    ) {
      setSearchTerm(sharedSearchTerm);
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
    }
  }, [searchParams, searchTerm]);

  useEffect(() => {
    fetchEvents(requestPage, requestSearch);
  }, [fetchEvents, requestPage, requestSearch]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const eventId = queryParams.get("eventId");

    if (eventId) {
      // Automatically join the queue if the user came from a QR code
      const event = events.find((e) => e.id.toString() === eventId);
      if (event) {
        joinQueue(event);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        ); // Clear the URL parameter after joining
      }
    }
  }, [events]);

  const handlePageChange = (newPage) => {
    if (!isLoading && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchChange = (event) => {
    const nextSearchTerm = event.target.value;
    setSearchTerm(nextSearchTerm);
    setCurrentPage(1);
    updateSearchParams(nextSearchTerm ? { search: nextSearchTerm } : {});
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    updateSearchParams({});
  };

  const joinQueue = async (event) => {
<<<<<<< HEAD
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
=======
    if (joinInFlightRef.current) return;

    if (!userId && !event.allowAnonymousJoining) {
      toast.error("Please login or sign up to join a queue");
      navigate("/auth", {
        state: {
          returnTo: `/search?eventId=${event.id}&search=${encodeURIComponent(event.title)}`,
        },
      });
      return;
    }
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)

    // }

    joinInFlightRef.current = true;
    setJoiningEventId(event.id);

    try {
<<<<<<< HEAD
      setIsLoading(true);
      if (isUserInQueue) {
        showToast.error("You're already in a queue.");
        return;
      }
      if (!userId && !event.allowAnonymousJoining) {
        showToast.error(
          "The Event Organizer has disabled anonymous joining. Please login or sign up to join this queue"
        );
        setShowAuthModal("login");
        return;
      }
      if (event.enableGeographicRestriction) {
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            if (position) {
              const { latitude, longitude } = position.coords;
              const distance = calculateDistance(
                event.latitude,
                event.longitude,
                latitude,
                longitude
              );

              console.log(event);
              if (distance > event.radiusInMeters) {
                showToast.error(
                  `You are ${Math.round(
                    distance,
                    2
                  )} meters away from the event Location. Please move closer to at least ${
                    event.radiusInMeters
                  } meters to join the queue.`
                );
                return;
              }
            }
          } catch (error) {
            if (error.code === error.PERMISSION_DENIED) {
              showToast.error(
                "Please enable location services to join as this event is geographically restricted."
              );
            } else {
              showToast.error(
                "An error occurred while getting your location. Please try again."
              );
            }
            return;
          }
        } else {
          showToast.error("Your browser does not support geolocation.");
          return;
        }
      }

      function calculateDistance(lat1, lon1, lat2, lon2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
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

          saveAuthTokensFromSignalR(res);
          await connection.stop(); // Stop if already connected
          await connection.start();

          if (!res.status) {
            showToast.error(res.message);
            return;
          }
          showToast.success("Joined queue successfully");
          localStorage.setItem("showFeedbackForm", true);
          navigate("/myQueue");
        } catch (error) {
          showToast.error(
            "Failed to join queue. please try again later. if the problem persists, please contact support."
          );
          console.log("Error joining queue:", error);
        } finally {
          setIsReconnecting(false); // Hide loading indicator
        }
      };

      if (!event.isActive) {
        const confirmValue = confirm(
          "This event has been paused by the Organizer. The estimated wait time in queue would start counting once the event is resumed. Do you want to continue?"
        );
        if (confirmValue) {
          joinQueueLogic();
        }
      } else {
        joinQueueLogic();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
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
=======
      const response = await invokeWithLoading(
        connection,
        "JoinQueueGroup",
        event.id,
        userId
      );

      if (!response?.status) {
        toast.error(response?.message ?? "Unable to join this queue.");
        return;
      }

      if (response.isNewUser && response.accessToken) {
        storeAuthTokens(response.accessToken);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("userName", response.username);
        localStorage.setItem("userEmail", response.email);
        await ensureSignalRConnected();
      }

      setIsUserInQueue(true);
      toast.success("Joined queue successfully");
      navigate("/myQueue");
    } catch (requestError) {
      console.error("Error joining queue", requestError);
      toast.error(
        "Error joining queue. Please refresh and try again if the problem persists."
      );
    } finally {
      joinInFlightRef.current = false;
      setJoiningEventId(null);
    }
  };

  const handleShare = async (eventId) => {
    const shareUrl = `${window.location.origin}/events/${eventId}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
        document.body.removeChild(textArea);
      }
      toast.success("Event link copied!");
    } catch (copyError) {
      console.error("Failed to copy event link", copyError);
      toast.error("Failed to copy event link");
    }
  };

<<<<<<< HEAD
  return (
    <div
      className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto ${
        isReconnecting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {isReconnecting && <GlobalSpinner />}{" "}
      {/* Show spinner during reconnection */}
      {isCreatingAccount && <GlobalSpinner />}{" "}
      {/* Show spinner during account creation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold ">Featured Events</h2>
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
=======
  const retry = () => fetchEvents(requestPage, requestSearch);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sage-600 dark:text-sage-300">
              Find your next stop
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Search events
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
              Browse live queues and join remotely when it is time to go.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <label
              htmlFor="event-search"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Search by event name
            </label>
            <div className="relative">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="event-search"
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="e.g. Campus clinic"
                autoComplete="off"
                className="w-full rounded-xl border border-sage-200 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 shadow-sm outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-sage-900"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:scale-100 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sage-500 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  aria-label="Clear event search"
                >
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="mb-5 flex min-h-6 items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
            {isLoading
              ? "Looking for events…"
              : events.length > 0
              ? `${events.length} event${events.length === 1 ? "" : "s"} on this page`
              : searchTerm
              ? `No results for “${searchTerm}”`
              : "No events available"}
          </p>
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-xs font-medium text-sage-700 dark:text-sage-300">
              <FiRefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              Updating
            </span>
          )}
>>>>>>> 5590c04 (feat: Implement SignalR Notifier for queue management and user notifications)
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Loading events"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <section
            className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-gray-800"
            role="alert"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Events are taking a moment to load
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:scale-100 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </section>
        ) : events.length === 0 ? (
          <section className="rounded-2xl border border-sage-200 bg-white px-6 py-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 dark:bg-sage-900/30 dark:text-sage-300">
              <FiSearch className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {searchTerm ? "No matching events" : "No events yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300">
              {searchTerm
                ? "Try a shorter search or clear the filter to see every available event."
                : "When organizers publish a queue, it will appear here for attendees to discover."}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 rounded-xl border border-sage-300 px-4 py-3 text-sm font-semibold text-sage-700 transition-colors hover:scale-100 hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-900/30"
              >
                Clear search
              </button>
            )}
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isUserInQueue={isUserInQueue}
                  isJoining={joiningEventId === event.id}
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
      </div>
    </main>
  );
};

export default SearchEvents;
