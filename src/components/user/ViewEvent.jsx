import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiMapPin,
  FiRefreshCw,
  FiShare2,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchEventById } from "../../services/swiftlineService";

const formatEventTime = (value) => {
  if (!value) return "Time not set";

  const valueAsText = String(value);
  const date = new Date(
    valueAsText.includes("T")
      ? valueAsText
      : `1970-01-01T${valueAsText}`
  );

  return Number.isNaN(date.getTime())
    ? valueAsText
    : date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
};

const DetailItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-600 dark:bg-sage-900/30 dark:text-sage-300">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium text-gray-800 dark:text-gray-100">
        {children}
      </div>
    </div>
  </div>
);

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchEventById(eventId);
        const eventData = response?.data?.data;
        if (!eventData) throw new Error("Event not found");
        if (isCurrent) setEvent(eventData);
      } catch (requestError) {
        if (!isCurrent) return;
        setEvent(null);
        setError("We couldn't load this event. It may have been removed or the link may be out of date.");
        toast.error("Event not found");
        console.error("Failed to load event", requestError);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadEvent();
    return () => {
      isCurrent = false;
    };
  }, [eventId]);

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      if (!document.execCommand("copy")) throw new Error("Copy failed");
      toast.success("Event link copied!");
    } catch (copyError) {
      console.error("Failed to copy event link", copyError);
      toast.error("Failed to copy event link");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/events/${eventId}`;

    if (!navigator.clipboard?.writeText) {
      fallbackCopy(shareUrl);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Event link copied!");
    } catch (copyError) {
      console.error("Failed to copy event link", copyError);
      fallbackCopy(shareUrl);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl" role="status" aria-busy="true">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-32 rounded bg-sage-100 dark:bg-gray-700" />
            <div className="h-72 rounded-2xl border border-sage-100 bg-white dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <span className="sr-only">Loading event details</span>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-gray-800" role="alert">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Event unavailable
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-300">
            {error || "This event could not be found."}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sage-300 px-4 py-3 text-sm font-semibold text-sage-700 transition-colors hover:scale-100 hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-900/30"
            >
              <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go back
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:scale-100 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  const queueIsOpen = Boolean(event.isActive);
  const capacityLabel = event.capacity
    ? `${event.usersInQueue ?? 0} / ${event.capacity}`
    : `${event.usersInQueue ?? 0}`;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sage-50 px-4 py-6 dark:bg-gray-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-sage-700 transition-colors hover:scale-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 dark:text-sage-200 dark:hover:bg-gray-800"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to events
        </button>

        <article className="overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <header className="border-b border-sage-100 px-5 py-6 sm:px-8 sm:py-8 dark:border-gray-700">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      queueIsOpen
                        ? "border-[#698474] bg-white text-[#2E4636] dark:border-[#8FAE98] dark:bg-[#1C1F24] dark:text-[#C3D8C9]"
                        : "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {queueIsOpen ? (
                      <FiCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <FiLock className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {queueIsOpen ? "Queue open" : "Queue unavailable"}
                  </span>
                </div>
                <h1 className="break-words text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                  {event.title || "Untitled event"}
                </h1>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Hosted by <span className="font-semibold text-gray-800 dark:text-gray-100">{event.organizer || "SwiftLine organizer"}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-sage-300 px-4 py-3 text-sm font-semibold text-sage-700 transition-colors hover:scale-100 hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 dark:border-sage-700 dark:text-sage-200 dark:hover:bg-sage-900/30"
              >
                <FiShare2 className="h-4 w-4" aria-hidden="true" />
                Share event
              </button>
            </div>
          </header>

          <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0">
              <section aria-labelledby="event-description-title">
                <h2 id="event-description-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  About this event
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300">
                  {event.description || "The organizer has not added a description yet."}
                </p>
              </section>

              <section className="mt-8" aria-labelledby="event-schedule-title">
                <h2 id="event-schedule-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Schedule
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                    <DetailItem
                      icon={<FiCalendar className="h-4 w-4" aria-hidden="true" />}
                      label="Starts"
                    >
                      {formatEventTime(event.eventStartTime)}
                    </DetailItem>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                    <DetailItem
                      icon={<FiClock className="h-4 w-4" aria-hidden="true" />}
                      label="Ends"
                    >
                      {formatEventTime(event.eventEndTime)}
                    </DetailItem>
                  </div>
                </div>
              </section>

              {event.address && (
                <section className="mt-8" aria-labelledby="event-location-title">
                  <h2 id="event-location-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Location
                  </h2>
                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                    <DetailItem
                      icon={<FiMapPin className="h-4 w-4" aria-hidden="true" />}
                      label="Address"
                    >
                      {event.address}
                    </DetailItem>
                  </div>
                </section>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-sage-200 bg-sage-50 p-5 dark:border-sage-900/50 dark:bg-sage-900/20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Queue snapshot
              </h2>
              <div className="mt-5 space-y-5">
                <DetailItem
                  icon={<FiUsers className="h-4 w-4" aria-hidden="true" />}
                  label="In queue"
                >
                  {capacityLabel} {event.capacity ? "attendees" : "attendees currently"}
                </DetailItem>
                <DetailItem
                  icon={<FiClock className="h-4 w-4" aria-hidden="true" />}
                  label="Average wait"
                >
                  {event.averageTime ?? "—"} minutes
                </DetailItem>
              </div>

              <div className="mt-6 border-t border-sage-200 pt-5 dark:border-sage-900/50">
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {event.allowAnonymousJoining
                    ? "Guest joining is available for this queue."
                    : "Sign in is required to join this queue."}
                </p>
                {event.canManage ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/events/${event.id}/manage`)}
                    className="mt-4 w-full rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:scale-100 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
                  >
                    Manage queue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/search?eventId=${event.id}&search=${encodeURIComponent(event.title)}`)}
                    className="mt-4 w-full rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:scale-100 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
                  >
                    View joining options
                  </button>
                )}
              </div>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
};

export default ViewEvent;
