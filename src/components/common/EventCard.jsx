import { format } from "date-fns";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowRight, LockKeyholeOpen, Pause, QrCode } from "lucide-react";
import {
  FiShare2,
  FiX,
  FiDownload,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiUserPlus,
  FiMapPin,
  FiLock,
} from "react-icons/fi";
import { useTheme } from "../../services/utils/useTheme";

const EventCard = ({
  event,
  isUserInQueue,
  lastEventJoined,
  onShare,
  onJoin,
}) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { darkMode } = useTheme();

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

  // Format times
  const startTime = format(
    new Date(`1970-01-01T${event.eventStartTime}`),
    "h:mm a"
  );
  const endTime = format(
    new Date(`1970-01-01T${event.eventEndTime}`),
    "h:mm a"
  );

  // Status indicator logic
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
        icon: <span className="w-2 h-2 rounded-full bg-sage-500 mr-1"></span>,
        label: "LIVE",
        bgColor: darkMode ? "bg-sage-800" : "bg-sage-100",
        textColor: darkMode ? "text-sage-300" : "text-sage-700",
        animate: "animate-pulse",
      };
    }
    return null;
  };

  const status = getStatusIndicator();

  return (
    <div className={`
      group relative overflow-hidden rounded-xl border
      ${darkMode ? "border-gray-800 bg-gray-900 shadow-md hover:shadow-lg" : "border-gray-200 bg-white shadow-sm hover:shadow-md"}
      transition-all duration-300 hover:border-sage-300
    `}>
      {/* Status bar - changes based on event status */}
      <div
        className={`h-1.5 w-full transition-colors duration-300
          ${event.hasStarted ? "bg-sage-500" : !event.isActive ? "bg-amber-400" : (darkMode ? "bg-gray-800" : "bg-gray-200")}
        `}
      ></div>

      <div className="p-5">
        {/* Header area with event title and action buttons */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <h3 className={`text-lg font-semibold word-wrap ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              {event.title}
            </h3>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQRCode(true);
              }}
              className={`
                text-gray-500 hover:text-sage-500
                ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}
                p-2 rounded-lg transition-colors
              `}
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
                text-gray-500 hover:text-sage-500
                ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}
                p-2 rounded-lg transition-colors
              `}
              title="Share Event"
              aria-label="Share Event"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status badges row */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-6">
          {status && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} ${status.animate} shadow-sm`}
            >
              {status.icon}
              {status.label}
            </span>
          )}
          {isUserInQueue && lastEventJoined && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-blue-800 text-blue-300" : "bg-blue-100 text-blue-700"} shadow-sm`}>
              <FiCheckCircle className="w-3 h-3 mr-1" />
              IN QUEUE
            </span>
          )}
          {event.allowAnonymousJoining ? (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"} shadow-sm`}>
              ANONYMOUS
            </span>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"} shadow-sm`}>
              USERS
            </span>
          )}
          {event.enableGeographicRestriction && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${darkMode ?  "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"} shadow-sm`}>
              <FiLock className="w-3 h-3 mr-1" />
              GEO-RESTRICTED
            </span>            
          )}
        </div>

        {/* Description with proper truncation */}
        <p className={`text-sm mb-4 word-wrap min-h-12 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          {event.description || "No description available."}
        </p>

        {/* Time info */}
        <div className="flex mb-4 rounded-lg divide-x divide-gray-200 shadow-sm">
          <div className="flex-1 p-3">
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mb-1`}>Starts</p>
            <div className="flex items-center">
              <FiClock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              <span className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{startTime}</span>
            </div>
          </div>

          <div className="flex-1 p-3">
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mb-1`}>Ends</p>
            <div className="flex items-center">
              <FiClock className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              <span className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{endTime}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className={`rounded-lg p-2.5 flex flex-col items-center ${darkMode ? "bg-gray-800 text-gray-300 shadow-inner" : "bg-gray-100 text-gray-500 shadow-inner"}`}
          >
            <div className="flex items-center justify-center mb-1">
              <FiClock className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <p className="text-xs text-center">Avg Wait</p>
            <p className="text-sm font-semibold text-center">
              {event.averageTime} mins
            </p>
          </div>

          <div
            className={`rounded-lg p-2.5 flex flex-col items-center ${darkMode ? "bg-gray-800 text-gray-300 shadow-inner" : "bg-gray-100 text-gray-500 shadow-inner"}`}
          >
            <div className="flex items-center justify-center mb-1">
              <FiUsers className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <p className="text-xs text-center">In Queue</p>
            <p className="text-sm font-semibold text-center ">
              {event.usersInQueue}
            </p>
          </div>

          <div
            className={`rounded-lg p-2.5 flex flex-col items-center ${darkMode ? "bg-gray-800 text-gray-300 shadow-inner" : "bg-gray-100 text-gray-500 shadow-inner"}`}
          >
            <div className="flex items-center justify-center mb-1">
              <FiUserCheck className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <p className="text-xs text-center">Staff Serving</p>
            <p className="text-sm font-semibold text-center">
              {event.staffCount}
            </p>
          </div>
        </div>

        {/* Organizer info */}
        <div className={`flex items-center gap-2.5 mb-4 p-3 rounded-lg ${darkMode ? "bg-gray-800 text-gray-300 shadow-inner" : "bg-gray-100 text-gray-600 shadow-inner"}`}>
          <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 text-sage-700">
            <FiUser className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs">Organized By</p>
            <p className="text-sm font-medium truncate">
              {event.organizer || "Unknown"}
            </p>
          </div>
        </div>

        {/* Join button with improved states */}
        <button
          disabled={!event.hasStarted || isUserInQueue}
          onClick={() => onJoin(event)}
          className={`w-full py-3 px-4 rounded-lg font-medium text-center flex items-center justify-center gap-2 transition-all shadow-sm
            ${
              !event.hasStarted
                ? (darkMode ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-500 cursor-not-allowed")
                : isUserInQueue
                ? (darkMode ? "bg-amber-900 text-amber-300 cursor-not-allowed" : "bg-amber-100 text-amber-700 cursor-not-allowed")
                : "bg-sage-500 text-white hover:bg-sage-600"
            }
          `}
        >
          {!event.hasStarted ? (
            <>
              <FiClock className="w-4 h-4" />
              Not Started
            </>
          ) : isUserInQueue && lastEventJoined ? (
            <>
              <FiMapPin className="w-4 h-4" />
              In This Queue
            </>
          ) : isUserInQueue && !lastEventJoined ? (
            <>
              <FiCheckCircle className="w-4 h-4" />
              In Another Queue
            </>
          ) : (
            <>
              <FiUserPlus className="w-4 h-4" />
              Join Queue
            </>
          )}
        </button>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          onClick={() => setShowQRCode(false)}
        >
          <div
            className={`bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full shadow-xl animate-fadeIn`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {event.title}
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-5 mb-5 rounded-lg bg-gray-50 dark:bg-gray-800">
                <QRCodeCanvas
                  id={`qr-code-${event.id}`}
                  value={eventUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/Swiftline_logo.jpeg", // Ensure you have this small logo
                    x: undefined,
                    y: undefined,
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </div>

              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-5 text-center`}>
                Scan to join this queue
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => setShowQRCode(false)}
                  className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 border ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"} transition-colors`}
                >
                  <FiX size={16} /> Cancel
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
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

export default EventCard;