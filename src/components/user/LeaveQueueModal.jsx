import { useState } from 'react';

import React from 'react'
import { useTheme } from '../../services/utils/useTheme';

const LeaveQueueModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedReason = reason === 'other' ? otherReason : reason;
    onConfirm(selectedReason);
  };

  const {darkMode} = useTheme();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl p-4 sm:p-6 max-w-sm w-full border border-gray-100 transform transition-all duration-200`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-black-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Leave Queue</h2>
          <p className="text-gray-500 text-sm">Help us improve by sharing why you're leaving</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Options */}
          <div className="space-y-2">
            {[
              { value: 'got_served', label: 'Got served elsewhere', icon: '✓' },
              { value: 'too_slow', label: 'Queue moving too slow', icon: '⏱' },
              { value: 'other', label: 'Other reason', icon: '💭' }
            ].map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-600' } group ${
                  reason === option.value
                    ? 'border-sage-500 bg-sage-100 shadow-sm'
                    :  'border-gray-500 hover:border-sage-500'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                  reason === option.value
                    ? 'border-sage-500 bg-sage-500'
                    : `border-gray-300 group-hover:border-sage-400`
                }`}>
                  {reason === option.value && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center flex-1">
                  <span className="text-sm mr-2">{option.icon}</span>
                  <span className={`text-sm font-medium ${
                    reason === option.value ? 'text-sage-900' : `${darkMode} ? 'text-gray-200' : 'text-gray-500`
                  }`}>
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
                  className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-sage-500 focus:outline-none transition-colors placeholder-gray-400"
                  required
                />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
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
export default LeaveQueueModal