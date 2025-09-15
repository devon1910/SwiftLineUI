import React, { useState } from 'react'

 const Tooltip = ({ children, content, darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-10 px-3 py-2 text-sm rounded-lg shadow-lg bottom-full left-0 mb-2 w-80 max-w-sm
          ${darkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}
        `}>
          {content}
          <div className={`absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent
            ${darkMode ? 'border-t-gray-800' : 'border-t-white'}
          `}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip