import React from 'react'
const GlobalSpinner = ({message=""}) => {
    return (
      <div className="global-spinner-overlay">
        <div className="global-spinner">
          {/* <LoadingSpinner/> */}
          <div className="spinner">{message}</div>
        </div>
      </div>
    );
  };

export default GlobalSpinner

