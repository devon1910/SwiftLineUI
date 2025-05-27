import React from 'react';
import { Eye, EyeSlashFill } from 'react-bootstrap-icons';

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  autoComplete,
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
  className = '',
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
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
          autoComplete={autoComplete}
          className={`mt-1 block w-full text-black px-3 py-2 ${className}`}
        />
        {showPasswordToggle && (
          <div
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? <Eye className='text-black'/> : <EyeSlashFill className='text-black'/>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput; 