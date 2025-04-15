import { useState } from 'react';
import  { QRCodeCanvas } from 'qrcode.react';
import { FiDownload, FiX } from 'react-icons/fi';

const EventQRCode = ({ eventId, eventTitle, onClose }) => {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const eventUrl = `${window.location.origin}/search?eventId=${eventId}&search=${encodeURIComponent(eventTitle)}`;

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      setDownloadUrl(pngUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Event QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="border border-gray-200 p-4 mb-4">
            <QRCodeCanvas 
              id="qr-code-canvas"
              value={eventUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-4 text-center">
            Scan this QR code to join <strong>{eventTitle}</strong>
          </p>
          
          <a
            href={downloadUrl || '#'}
            download={`${eventTitle}-QRCode.png`}
            onClick={handleDownload}
            className="bg-sage-500 hover:bg-sage-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiDownload /> Download QR Code
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventQRCode;