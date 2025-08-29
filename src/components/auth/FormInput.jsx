import React from 'react';
import { Eye, EyeSlashFill } from 'react-bootstrap-icons';

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  onFocus,
  onBlur,
  autoComplete,
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
  className = '', // Retain for custom overrides
  darkMode, // New prop to pass dark mode state
}) => {
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium mb-1
        ${darkMode ? "text-gray-200" : "text-gray-700"}
      `}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={`mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition duration-200
            ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"}
            ${className}
          `}
        />
        {showPasswordToggle && (
          <button
            type="button" // Important for accessibility and preventing form submission
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <Eye className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            ) : (
              <EyeSlashFill className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput;