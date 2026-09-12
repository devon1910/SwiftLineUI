import { FiShare2, FiUser } from "react-icons/fi";
import { format } from "date-fns";
import StatItem from "./user/StatItem";

const formatEventTime = (value) => {
  if (!value) return "Time not set";

  const valueAsText = String(value);
  const date = new Date(
    valueAsText.includes("T")
      ? valueAsText
      : `1970-01-01T${valueAsText}`
  );

  return Number.isNaN(date.getTime()) ? valueAsText : format(date, "h:mm a");
};

const EventCard = ({ event, isUserInQueue, isJoining = false, onShare, onJoin }) => {
  const queueStatusKnown = typeof isUserInQueue === "boolean";
  const isOpen = Boolean(event.hasStarted) && event.isActive !== false;
  const isLive = Boolean(event.isLive);
  const isPaused = Boolean(event.hasStarted) && event.isActive === false;
  const canJoin =
    isOpen && queueStatusKnown && !isUserInQueue && !isJoining;

  const status = isPaused
    ? {
        label: "Queue paused",
        className:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200",
      }
    : isLive
    ? {
        label: "Live now",
        className:
          "border-[#698474] bg-white text-[#2E4636] dark:border-[#8FAE98] dark:bg-[#1C1F24] dark:text-[#C3D8C9]",
      }
    : isOpen
    ? {
        label: "Open",
        className:
          "border-[#698474] bg-white text-[#2E4636] dark:border-[#8FAE98] dark:bg-[#1C1F24] dark:text-[#C3D8C9]",
      }
    : {
        label: "Upcoming",
        className:
          "border-sage-200 bg-sage-50 text-sage-700 dark:border-sage-900/50 dark:bg-sage-900/20 dark:text-sage-200",
      };

  const joinLabel = isJoining
    ? "Joining queue…"
    : !queueStatusKnown
    ? "Checking queue status"
    : isPaused
    ? "Queue is paused"
    : isUserInQueue
    ? "Already in queue"
    : !event.hasStarted
    ? "Event not started"
    : "Join queue";

  return (
    <article
      className={`event-card group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 ${
        event.isShared
          ? "border-sage-400 dark:border-sage-600"
          : "border-sage-200 dark:border-gray-700"
      }`}
      aria-labelledby={`event-${event.id}-title`}
    >
      <div className="event-card__body flex flex-1 flex-col p-5 sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
              >
                {isLive && !isPaused && (
                  <span
                    className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600"
                    aria-hidden="true"
                  />
                )}
                {status.label}
              </span>
              {event.isShared && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  Shared
                </span>
              )}
            </div>
            <h3
              id={`event-${event.id}-title`}
              className="event-card__title break-words text-xl font-semibold leading-tight text-gray-900 dark:text-gray-100"
            >
              {event.title || "Untitled event"}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onShare?.(event.id, event.title)}
            className="shrink-0 rounded-lg p-2 text-sage-600 transition-colors hover:scale-100 hover:bg-sage-50 hover:text-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 dark:text-sage-300 dark:hover:bg-sage-900/30 dark:hover:text-sage-200"
            aria-label={`Share ${event.title || "event"}`}
            title="Share event"
          >
            <FiShare2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <p className="mt-4 min-h-[3.75rem] line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {event.description || "No description provided for this event."}
        </p>

        <div className="event-card__metrics mt-5 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
          <StatItem
            label="Average Wait"
            value={
              event.averageTime === null || event.averageTime === undefined
                ? "—"
                : `${event.averageTime} mins`
            }
          />
          <StatItem
            label="Users In Queue"
            value={event.usersInQueue ?? "—"}
          />
          <StatItem label="Starts" value={formatEventTime(event.eventStartTime)} />
          <StatItem label="Ends" value={formatEventTime(event.eventEndTime)} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-sage-100 bg-sage-50/70 p-3.5 dark:border-sage-900/50 dark:bg-sage-900/20">
          <FiUser
            className="mt-0.5 h-5 w-5 shrink-0 text-sage-600 dark:text-sage-300"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-sage-700 dark:text-sage-300">
              Organized by
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">
              {event.organizer || "SwiftLine organizer"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <button
            type="button"
            disabled={!canJoin}
            onClick={() => onJoin?.(event)}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 hover:scale-100 ${
              canJoin
                ? "bg-sage-600 text-white hover:bg-sage-700"
                : "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            }`}
            aria-label={`${joinLabel} for ${event.title || "this event"}`}
          >
            {joinLabel}
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
