import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const QRCodeScanner = ({ onScanSuccess, onClose }) => {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );
    
    html5QrcodeScanner.render(
      (decodedText) => {
        html5QrcodeScanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Handle scan error
        console.log(error)
      }
    );
    
    setScanner(html5QrcodeScanner);
    
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <div id="qr-reader" className="w-full"></div>
      </div>
    </div>
  );
};

export default QRCodeScanner