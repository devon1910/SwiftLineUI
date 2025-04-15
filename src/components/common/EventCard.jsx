import { FiDownload, FiShare2, FiUser, FiX } from "react-icons/fi";
import StatItem from "./StatItem";
import { format } from "date-fns";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";

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

  return (
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
      {event.hasStarted && <div className="pulse-overlay" />}

      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </h3>
              {event.hasStarted && <span className="ongoing-badge">LIVE</span>}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQRCode(true);
              }}
              className="text-sage-500 hover:text-sage-600 p-1"
              title="Generate QR Code"
            >
            <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(event.id, event.title);
              }}
              className="text-sage-500 hover:text-sage-600 p-1"
              title="Share Event"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
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
            value={format(
              new Date(`1970-01-01T${event.eventEndTime}`),
              "h:mm a"
            )}
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
          disabled={!event.hasStarted || isUserInQueue || !event.isActive}
          onClick={() => onJoin(event)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            !event.hasStarted
              ? "bg-sage-200 text-sage-600 cursor-not-allowed"
              : isUserInQueue
              ? "bg-sage-200 text-sage-600 cursor-not-allowed"
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

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Event QR Code</h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="border border-gray-200 p-4 mb-4">
                <QRCodeCanvas
                  id={`qr-code-${event.id}`}
                  value={eventUrl}
                  size={256}
                  level="H"
                />
              </div>

              <p className="text-sm text-gray-600 mb-4 text-center">
                Scan this QR code to join <strong>{event.title}</strong>
              </p>

              <button
                onClick={handleDownloadQR}
                className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiDownload /> Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
