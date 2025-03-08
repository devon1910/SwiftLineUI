import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = "Loading...", variant = "primary" }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100%", padding: "20px" }}
    >
      <Spinner animation="border" variant={variant} role="status" />
      <span className="ms-2">{message}</span>
    </div>
  );
};

export default LoadingSpinner;