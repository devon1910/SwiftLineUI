import { QRCodeCanvas } from 'qrcode.react'
import React from 'react'
import { FiDownload, FiX } from 'react-icons/fi'

const QRCodeModal = ({handleDownloadQR, eventUrl, event, setShowQRCode, darkMode}) => {
  return (
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
  )
}

export default QRCodeModal