import { FiShare2, FiUser } from "react-icons/fi";
import StatItem from "./user/StatItem";
import { format } from "date-fns";

const EventCard = ({ event, isUserInQueue, onShare, onJoin }) => (
  <div
    className={`relative rounded-xl shadow-md border ${
      event.isShared ? "border-2 border-sage-500" : "border-sage-200"
    } dark:border-gray-700 hover:shadow-lg transition-shadow`}
  >
    {/* {event.isShared && (
        <div className="absolute top-4 left-4 bg-sage-500 text-white px-2 py-1 rounded-full text-xs">
          Shared Event
        </div>
      )}
   */}
    {event.isOngoing && <div className="pulse-overlay" />}

    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {event.title}
            </h3>
            {event.isOngoing && <span className="ongoing-badge">LIVE</span>}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(event.id, event.title);
          }}
          className="text-sage-500 hover:text-sage-600 p-1"
        >
          <FiShare2 className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm">{event.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Average Wait" value={`${event.averageTime} mins`} />
        <StatItem label="Users In Queue" value={event.usersInQueue} />
        <StatItem
          label="Starts"
          value={format(
            new Date(`1970-01-01T${event.eventStartTime}`),
            "h:mm a"
          )}
        />
        <StatItem
          label="Ends"
          value={format(new Date(`1970-01-01T${event.eventEndTime}`), "h:mm a")}
        />
      </div>
      <div className="flex items-start gap-3 bg-sage-50 p-3 rounded-lg">
        <div className="text-sage-500 flex-shrink-0">
          <FiUser className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">Organized By</p>
          <p className="text-sm font-semibold break-words overflow-hidden text-ellipsis whitespace-normal max-w-full">
            {event.organizer || "Unknown Organizer"}
          </p>
        </div>
      </div>

      <button
        disabled={!event.isOngoing || isUserInQueue}
        onClick={() => onJoin(event)}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
          !event.isOngoing
            ? "bg-sage-200 text-sage-600 cursor-not-allowed"
            : isUserInQueue
            ? "bg-sage-200 text-sage-600 cursor-not-allowed"
            : "bg-sage-500 text-white hover:bg-sage-600"
        }`}
      >
        {!event.isOngoing
          ? "Event Not Started"
          : isUserInQueue
          ? "Already in Queue"
          : "Join Queue"}
      </button>
    </div>
  </div>
);

export default EventCard;
