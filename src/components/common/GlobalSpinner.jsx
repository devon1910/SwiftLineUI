import React from 'react'
const GlobalSpinner = () => {
    return (
      <div className="global-spinner-overlay">
        <div className="global-spinner">
          {/* <LoadingSpinner/> */}
          <div className="spinner"></div>
        </div>
      </div>
    );
  };

export default GlobalSpinner

