import React from 'react';
import { CheckCircle } from 'react-bootstrap-icons';

const PasswordRequirements = ({ password }) => {
  const requirements = {
    hasMinLength: password.length >= 6,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className={`flex items-center ${requirements.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
        <CheckCircle className={`w-4 h-4 mr-1 ${requirements.hasMinLength ? 'visible' : 'invisible'}`} />
        <span>6+ characters</span>
      </div>
      <div className={`flex items-center ${requirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
        <CheckCircle className={`w-4 h-4 mr-1 ${requirements.hasSpecialChar ? 'visible' : 'invisible'}`} />
        <span>Special char (e.g $)</span>
      </div>
      <div className={`flex items-center ${requirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
        <CheckCircle className={`w-4 h-4 mr-1 ${requirements.hasNumber ? 'visible' : 'invisible'}`} />
        <span>Number</span>
      </div>
    </div>
  );
};

export default PasswordRequirements; 