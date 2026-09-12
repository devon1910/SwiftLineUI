import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import EventCard from "../EventCard.jsx";
import PaginationControls from "../common/PaginationControl.jsx";
import { eventsList, joinEventQueue } from "../../services/swiftlineService";

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

  const [searchParams, updateSearchParams] = useSearchParams();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
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
    } finally {
      if (requestId === latestRequestRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const sharedSearchTerm = searchParams.get("search");
    if (
      searchParams.get("eventId") &&
      sharedSearchTerm !== null &&
      sharedSearchTerm !== searchTerm
    ) {
      setSearchTerm(sharedSearchTerm);
    }
  }, [searchParams, searchTerm]);

  useEffect(() => {
    fetchEvents(requestPage, requestSearch);
  }, [fetchEvents, requestPage, requestSearch]);

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

    if (isUserInQueue) {
      toast.warning("You're already in a queue");
      return;
    }

    joinInFlightRef.current = true;
    setJoiningEventId(event.id);

    try {
      await joinEventQueue(event.id);

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
        document.body.removeChild(textArea);
      }
      toast.success("Event link copied!");
    } catch (copyError) {
      console.error("Failed to copy event link", copyError);
      toast.error("Failed to copy event link");
    }
  };

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
