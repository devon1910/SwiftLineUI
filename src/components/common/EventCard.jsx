import { format } from "date-fns";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowRight,
  Clock,
  QrCode,
  User,
  Pause,
  ArrowRightCircle,
  Users,
} from "lucide-react";
import {
  FiShare2,
  FiX,
  FiDownload,
  FiUserPlus,
  FiCheckCircle,
  FiLock,
} from "react-icons/fi";
import { useTheme } from "../../services/utils/useTheme";
import QRCode from "../user/QRCodeModal";
import QRCodeModal from "../user/QRCodeModal";
import EventDetails from "../user/EventCardDetails";

const EventCard = ({
  event,
  isUserInQueue,
  lastEventJoined,
  onShare,
  onJoin,
  isLoading,
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { darkMode } = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-code-${event.id}`);
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${event.title.replace(/\s+/g, "-")}-QRCode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const eventUrl = `${window.location.origin}/search?eventId=${
    event.id
  }&search=${encodeURIComponent(event.title)}`;

  const getStatusIndicator = () => {
    if (!event.isActive) {
      return {
        icon: <Pause className="w-3 h-3" />,
        label: "PAUSED",
        bgColor: darkMode ? "bg-amber-800" : "bg-amber-100",
        textColor: darkMode ? "text-amber-300" : "text-amber-700",
        animate: "animate-pulse",
      };
    } else if (event.hasStarted) {
      return {
        icon: (
          <span className="w-2 h-2 rounded-full bg-sage-500 mr-1"></span>
        ),
        label: "LIVE",
        bgColor: darkMode ? "bg-sage-800" : "bg-sage-100",
        textColor: darkMode ? "text-sage-300" : "text-sage-700",
        animate: "animate-pulse",
      };
    }
    return null;
  };

  const status = getStatusIndicator();

  const startTime = format(
    new Date(`1970-01-01T${event.eventStartTime}`),
    "h:mm a"
  );
  const endTime = format(
    new Date(`1970-01-01T${event.eventEndTime}`),
    "h:mm a"
  );

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-300 ${
        darkMode
          ? "border-gray-800 bg-gray-900 hover:shadow-lg"
          : "border-gray-200 bg-white hover:shadow-md"
      } hover:border-sage-300`}
    >
      {/* Header and Action buttons */}
      <div className="flex items-start justify-between">
        <h4
          className={`font-semibold word-wrap text-lg ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {event.title}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQRCode(true);
            }}
            className={`
              text-gray-500 hover:text-sage-500 p-2 rounded-lg transition-colors
              ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            title="Generate QR Code"
            aria-label="Generate QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(event.title);
            }}
            className={`
              text-gray-500 hover:text-sage-500 p-2 rounded-lg transition-colors
              ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            title="Share Event"
            aria-label="Share Event"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {status && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${status.bgColor} ${status.textColor} ${status.animate}`}
          >
            {status.icon}
            {status.label}
          </span>
        )}
        {isUserInQueue && lastEventJoined && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
              darkMode ? "bg-blue-800 text-blue-300" : "bg-blue-100 text-blue-700"
            }`}
          >
            <FiCheckCircle className="w-3 h-3 mr-1" />
            IN QUEUE
          </span>
        )}
        {event.enableGeographicRestriction && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
              darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
            }`}
          >
            <FiLock className="w-3 h-3 mr-1" />
            GEO-RESTRICTED
          </span>
        )}
      </div>

      {/* Key Stats */}
      <div
        className={`mt-4 grid grid-cols-2 gap-3 rounded-lg p-3 ${
          darkMode ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2">
          
          <div className="">
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
             <Clock className="h-3 w-3 text-gray-500 inline" /> Avg. Wait
            </p>
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {event.averageTime} {event.averageTime > 1 ? "mins" : "min"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <div>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Users className="h-3 w-3 text-gray-500 inline"/> In Queue
            </p>
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {event.usersInQueue}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
            console.log("View Details clicked: show details =", showDetails);
            
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-center font-medium text-gray-500 transition-all ${
            darkMode
              ? "border-gray-700 hover:bg-gray-700/50"
              : "border-gray-200 hover:bg-gray-100"
          }`}
        >
          <ArrowRightCircle className="h-4 w-4" />
          Details
        </button>

        {/* Join Queue Button */}
        <button
          disabled={!event.hasStarted || isUserInQueue || isLoading}
          onClick={(e) => {
            e.stopPropagation();
            onJoin(event);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-center font-medium transition-all shadow-sm ${
            !event.hasStarted
              ? darkMode
                ? "cursor-not-allowed bg-gray-700 text-gray-500"
                : "cursor-not-allowed bg-gray-100 text-gray-500"
              : isUserInQueue
              ? darkMode
                ? "cursor-not-allowed bg-blue-900 text-blue-300"
                : "cursor-not-allowed bg-blue-100 text-blue-700"
              : "bg-sage-500 text-white hover:bg-sage-600"
          }`}
        >
          {isLoading ? (
            <svg
              className="h-4 w-4 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : isUserInQueue ? (
            <>
              <FiCheckCircle className="h-4 w-4" />
              In Queue
            </>
          ) : (
            <>
              <FiUserPlus className="h-4 w-4" />
              Join Queue
            </>
          )}
        </button>
      </div>

      {/* QR Code Modal (unchanged) */}
      {showQRCode && (
          <QRCodeModal 
              handleDownloadQR={handleDownloadQR} 
              eventUrl={eventUrl} 
              event={event} 
              setShowQRCode={setShowQRCode} 
              darkMode={darkMode}/>
      )}
      {showDetails &&
       (<EventDetails 
       onJoin={onJoin}
       isUserInQueue={isUserInQueue}
       event={event} 
       setShowDetails={setShowDetails} 
       isLoading={isLoading}
       />

       )}
      {}
    </div>
  );
};

export default EventCard;