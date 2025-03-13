import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = "Loading..."}) => {
  return (
    <div>
      <span className="ms-4">{message}</span>
    </div>
  );
};
// className="d-flex justify-content-center align-items-center"
// style={{ height: "100%", padding: "20px" }}

export default LoadingSpinner;