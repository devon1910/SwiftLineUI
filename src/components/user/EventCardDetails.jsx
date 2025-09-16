// components/EventDetails.jsx
import { format } from "date-fns";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useTheme } from "../../services/utils/useTheme";
import {
  Clock,
  QrCode,
  User,
  Users,
  MapPin,
  LockKeyholeOpen,
  Pause,
} from "lucide-react";
import {
  FiShare2,
  FiX,
  FiDownload,
  FiUser,
  FiUserCheck,
  FiLock,
  FiClock,
} from "react-icons/fi";

const EventDetails = ({ event, isUserInQueue, onJoin, isLoading, setShowDetails }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { darkMode } = useTheme();

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Event not found.
      </div>
    );
  }

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
        icon: <Pause className="w-4 h-4" />,
        label: "PAUSED",
        bgColor: darkMode ? "bg-amber-800" : "bg-amber-100",
        textColor: darkMode ? "text-amber-300" : "text-amber-700",
        animate: "animate-pulse",
      };
    } else if (event.hasStarted) {
      return {
        icon: <span className="w-2.5 h-2.5 rounded-full bg-sage-500 mr-2"></span>,
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
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md ${
        darkMode
          ? "bg-gray-900 text-gray-200"
          : "bg-white text-gray-800"
      }`}
    >
      {/* Close button for modal/sidebar use */}
      <button
          onClick={setShowDetails(false)}
          className={`absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-colors hover:text-gray-700 md:right-6 md:top-6 ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>

      {/* Header and Actions */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-start">
        <div className="flex-1">
          <h1
            className={`text-2xl font-bold md:text-3xl ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {event.title}
          </h1>
          <p
            className={`mt-1 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Organized by{" "}
            <span className="font-medium">{event.organizer || "Unknown"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQRCode(true)}
            className={`flex items-center justify-center gap-1 rounded-full p-3 transition-colors ${
              darkMode
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title="Generate QR Code"
            aria-label="Generate QR Code"
          >
            <QrCode className="h-5 w-5" />
          </button>
          <button
            onClick={() => onShare(event.title)}
            className={`flex items-center justify-center gap-1 rounded-full p-3 transition-colors ${
              darkMode
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title="Share Event"
            aria-label="Share Event"
          >
            <FiShare2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status and Info Badges */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {status && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${status.bgColor} ${status.textColor} ${status.animate} shadow-sm`}
          >
            {status.icon}
            {status.label}
          </span>
        )}
        {event.allowAnonymousJoining ? (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ${
              darkMode
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <LockKeyholeOpen className="h-4 w-4 mr-1" />
            ANONYMOUS
          </span>
        ) : (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ${
              darkMode
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <User className="h-4 w-4 mr-1" />
            USERS ONLY
          </span>
        )}
        {event.enableGeographicRestriction && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ${
              darkMode
                ? "bg-gray-800 text-gray-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <FiLock className="h-4 w-4 mr-1" />
            GEO-RESTRICTED
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Time and Stats */}
        <div>
          <h2
            className={`text-xl font-semibold ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Event Details
          </h2>
          <div className="mt-4 space-y-3">
            <p className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              Starts at <span className="font-medium ml-1">{startTime}</span>
            </p>
            <p className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              Ends at <span className="font-medium ml-1">{endTime}</span>
            </p>
            <p className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              Users in Queue: <span className="font-medium ml-1">{event.usersInQueue}</span>
            </p>
            <p className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              Avg. Wait Time: <span className="font-medium ml-1">
                {event.averageTime} {event.averageTime > 1 ? "mins" : "min"}
              </span>
            </p>
            <p className="flex items-center text-sm">
              <FiUserCheck className="h-4 w-4 mr-2 text-gray-500" />
              Staff Serving: <span className="font-medium ml-1">{event.staffCount}</span>
            </p>
            {event.location && (
              <p className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <span className="font-medium">{event.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h2
            className={`text-xl font-semibold ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            About this event
          </h2>
          <p
            className={`mt-4 text-sm leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {event.description || "No detailed description available."}
          </p>
        </div>
      </div>

      {/* Join Queue Button at the bottom */}
      <div className="mt-8">
        <button
          disabled={!event.hasStarted || isUserInQueue || isLoading}
          onClick={() => onJoin(event)}
          className={`w-full rounded-lg py-4 text-center text-lg font-bold transition-all shadow-lg ${
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
              className="h-6 w-6 animate-spin text-white inline-block"
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
            "You are already in this Queue"
          ) : (
            "Join Queue Now"
          )}
        </button>
      </div>

      {/* QR Code Modal (Unchanged) */}
      {showQRCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
          onClick={() => setShowQRCode(false)}
        >
          <div
            className={`w-full max-w-sm rounded-xl p-6 shadow-xl animate-fadeIn ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {event.title}
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`mb-5 rounded-lg border-2 border-dashed p-5 ${
                  darkMode
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <QRCodeCanvas
                  id={`qr-code-${event.id}`}
                  value={eventUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/Swiftline_logo.jpeg",
                    x: undefined,
                    y: undefined,
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </div>
              <p
                className={`mb-5 text-center text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Scan to join this queue
              </p>
              <div className="grid w-full grid-cols-2 gap-3">
                <button
                  onClick={() => setShowQRCode(false)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-medium transition-colors ${
                    darkMode
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiX size={16} /> Cancel
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-2 rounded-lg bg-sage-500 px-4 py-2.5 font-medium text-white shadow-md transition-all hover:bg-sage-600"
                >
                  <FiDownload size={16} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;