import { useState } from "react";
import FormInput from "./FormInput";

const PasswordReset = ({ onBackToLogin }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailSent(true);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
      {!emailSent ? (
        <>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="reset-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
            >
              Send reset link
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-sage-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
        </div>
      )}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm font-medium text-sage-600 hover:text-sage-700"
        >
          &larr; Back to login
        </button>
      </div>
    </div>
  );
};

export default PasswordReset;