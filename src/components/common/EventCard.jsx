import StatItem from "./StatItem";
import { format } from "date-fns";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowRight, Pause, QrCode } from "lucide-react";
import {
  FiShare2,
  FiX,
  FiDownload,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiCalendar,
  FiArrowRight,
} from "react-icons/fi";

const EventCard = ({ event, isUserInQueue, onShare, onJoin }) => {
  const [showQRCode, setShowQRCode] = useState(false);

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

  return (
    <div className="relative overflow-hidden rounded-xl shadow-md transition-all hover:shadow-lg border-l-4 border-transparent border">
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${
          event.hasStarted ? "bg-sage-500" : "bg-gray-200"
        }`}
      ></div>

      <div className="p-5">
        {/* Header with floating status */}
        <div className="flex justify-between items-start mb-4 relative">
          <div className="flex-1">
            <h3 className="text-xl font-bold">{event.title}</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQRCode(true);
              }}
              className="text-sage-500 hover:text-sage-600 bg-sage-50 p-2 rounded-full hover:bg-sage-100 transition-colors"
              title="Generate QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(event.id, event.title);
              }}
              className="text-sage-500 hover:text-sage-600 bg-sage-50 p-2 rounded-full hover:bg-sage-100 transition-colors"
              title="Share Event"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status indicators in a ribbon style */}
        <div className="flex gap-2 mb-3">
          {event.hasStarted && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              <span className="mr-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </span>
          )}
          {!event.isActive && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 animate-pulse">
              <Pause />
              PAUSED
            </span>
          )}
          {isUserInQueue && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <FiCheckCircle className="w-3 h-3 mr-1" />
              IN QUEUE
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
         {/* Stats in two columns */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 border-t">
          <div className="rounded-lg p-3 items-center flex">
            <div className="p-2 rounded-full mr-3 ">
              <FiClock className="w-4 h-4" />
            </div>
            <div className="">
              <p className="text-xs">Average Wait</p>
              <p className="text-sm font-bold">{event.averageTime} mins</p>
            </div>
          </div>

          <div className="rounded-lg p-3 flex items-center ">
            <div className="p-2 rounded-full mr-3">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs">Users In Queue</p>
              <p className="text-sm font-bold">{event.usersInQueue}</p>
            </div>
          </div>

          <div className="rounded-lg p-3 flex items-center">
            <div className="p-2 rounded-full mr-3">
              <FiUserCheck className="w-4 h-4 text-sage-500" />
            </div>
            <div>
              <p className="text-xs">Staff Serving</p>
              <p className="text-sm font-bold">{event.staffCount}</p>
            </div>
          </div>
        </div>

        {/* Time info in card format */}
        <div className="flex gap-4 mb-4 p-3 border-t">
          <div className="flex-1">
            <p className="text-xs mb-1">Starts</p>
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">{startTime}</span>
            </div>
          </div>
          
          <div className="w-px"></div>
          <div className="flex-1">
            <p className="text-xs mb-1">Ends</p>
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">{endTime}</span>
            </div>
          </div>
        </div>

       

        {/* Organizer Info as a footer */}
        <div className="flex items-center gap-3 mb-4 p-3 border-t">
          <div className="p-2 rounded-full bg-sage-100">
            <FiUser className="w-4 h-4 text-sage-500" />
          </div>
          <div>
            <p className="text-xs">Organized By</p>
            <p className="text-sm font-semibold truncate">
              {event.organizer || "Unknown Organizer"}
            </p>
          </div>
        </div>

        {/* Join Button with conditional styles */}
        <button
          disabled={!event.hasStarted || isUserInQueue || !event.isActive}
          onClick={() => onJoin(event)}
          className={`w-full py-3 px-4 rounded-lg font-medium text-center flex items-center justify-center gap-2 transition-all ${
            !event.hasStarted
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : isUserInQueue
              ? "bg-blue-100 text-blue-700 cursor-not-allowed"
              : !event.isActive
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-sage-500 text-white hover:bg-sage-600"
          }`}
        >
          {!event.hasStarted
            ? "Event Not Started"
            : isUserInQueue
            ? "Already in Queue"
            : !event.isActive
            ? "Queue is Paused"
            : "Join Queue"}
        </button>
      </div>

      {/* QR Code Modal with cleaner design */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Event QR Code
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="border-2 border-dashed border-gray-200 p-6 mb-4 rounded-lg">
                <QRCodeCanvas
                  id={`qr-code-${event.id}`}
                  value={eventUrl}
                  size={220}
                  level="H"
                />
              </div>

              <p className="text-sm text-gray-600 mb-5 text-center">
                Scan this QR code to join <strong>{event.title}</strong>
              </p>

              <button
                onClick={handleDownloadQR}
                className="bg-sage-500 hover:bg-sage-600 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2 w-full transition-all shadow-sm"
              >
                <FiDownload size={16} /> Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
