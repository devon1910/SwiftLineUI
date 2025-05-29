import { useState } from 'react';
import { useTheme } from '../../services/utils/useTheme';
import { FiLogOut } from 'react-icons/fi'; // Import the specific icon

const LeaveQueueModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedReason = reason === 'other' ? otherReason : reason;
    onConfirm(selectedReason);
  };

  const { darkMode } = useTheme(); // Directly use the hook to get darkMode state

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-100'} 
                  rounded-2xl shadow-2xl p-4 sm:p-6 max-w-sm w-full border transform transition-all duration-300`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} 
                      w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
            <FiLogOut className="w-6 h-6" /> {/* Replaced SVG with react-icon */}
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Leave Queue</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Help us improve by sharing why you're leaving</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Options */}
          <div className="space-y-3"> {/* Increased space for clarity */}
            {[
              { value: 'Got served', label: 'Got served elsewhere', icon: '✅' }, // Changed icon to checkmark
              { value: 'Too slow', label: 'Queue moving too slow', icon: '⏳' }, // Changed icon to hourglass
              { value: 'other', label: 'Other reason', icon: '💬' } // Changed icon to speech bubble
            ].map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group
                  ${reason === option.value
                    ? 'border-sage-500 bg-sage-100 shadow-sm'
                    : `${darkMode ? 'border-gray-600 hover:border-sage-500 hover:bg-gray-700' : 'border-gray-300 hover:border-sage-500 hover:bg-gray-100'}`
                  }
                `}
              >
                <input
                  type="radio"
                  name="reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-colors
                  ${reason === option.value
                    ? 'border-sage-500 bg-sage-500'
                    : `${darkMode ? 'border-gray-500 group-hover:border-sage-400' : 'border-gray-300 group-hover:border-sage-400'}`
                  }`}>
                  {reason === option.value && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center flex-1">
                  <span className="text-sm mr-2">{option.icon}</span>
                  <span className={`text-sm font-medium
                    ${reason === option.value ? 'text-sage-900' : `${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  `}>
                    {option.label}
                  </span>
                </div>
              </label>
            ))}

            {/* Other Reason Input */}
            {reason === 'other' && (
              <div className="mt-2 pl-4">
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Please tell us more..."
                  className={`w-full p-2.5 text-sm border-2 rounded-lg focus:border-sage-500 focus:outline-none transition-colors
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'}
                  `}
                  required
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3"> {/* Increased gap */}
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200
                ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || (reason === 'other' && !otherReason)}
              className="flex-1 px-4 py-2.5 text-sm bg-sage-600 text-white font-medium rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sage-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Leave Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LeaveQueueModal;