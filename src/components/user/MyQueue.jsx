import React, { useState, useEffect, useRef } from "react";
import { Card, Alert, ProgressBar, Button } from "react-bootstrap";
import Confetti from "react-confetti";
import DidYouKnowSlider from "./DidYouKnowSlider";
import { connection } from "../../services/SignalRConn.js";
import { GetUserLineInfo } from "../../services/swiftlineService";
import LoadingSpinner from "../LoadingSpinner";
import { FiArrowUp } from "react-icons/fi";

export const MyQueue = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [myQueue, setMyQueue] = useState({});

  useEffect(() => {
    getCurrentPosition();
    setIsLoading(false);
  }, []);


  const showConfetti = myQueue.timeTillYourTurn === 0;
  // Track window dimensions for the Confetti component.
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // State to control the display of the up arrow indicators.
  const [showPositionArrow, setShowPositionArrow] = useState(false);
  const [showWaitTimeArrow, setShowWaitTimeArrow] = useState(false);
  // useRef to store previous values.
  const prevPositionRef = useRef(myQueue.position);
  const prevTimeRef = useRef(myQueue.timeTillYourTurn);

  useEffect(() => {
    // Make sure connection is defined/initialized before using it
    if (connection) {
      console.log("Setting up SignalR listener for queue updates");
      
      // Register for position updates
      connection.on("ReceivePositionUpdate", (lineInfo) => {
        console.log("SignalR update received:", lineInfo);
        setMyQueue(lineInfo);
      });
      
      // Clean up when component unmounts
      return () => {
        console.log("Cleaning up SignalR listener");
        connection.off("ReceivePositionUpdate");
      };
    }
  }, []);  // Empty dependency array means it runs once on mount

  // Handle window resize (separate from SignalR concerns)
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compare position changes for arrow indicators
  useEffect(() => {
    if (prevPositionRef.current !== null && myQueue.position < prevPositionRef.current) {
      setShowPositionArrow(true);
      setTimeout(() => setShowPositionArrow(false), 25000);
    }
    prevPositionRef.current = myQueue.position;
  }, [myQueue.position]);

  // Compare time changes for arrow indicators
  useEffect(() => {
    if (prevTimeRef.current !== null && myQueue.timeTillYourTurn < prevTimeRef.current) {
      setShowWaitTimeArrow(true);
      setTimeout(() => setShowWaitTimeArrow(false), 25000);
    }
    prevTimeRef.current = myQueue.timeTillYourTurn;
  }, [myQueue.timeTillYourTurn]);

  function getCurrentPosition() {
    GetUserLineInfo()
      .then((response) => {
        setMyQueue(response.data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        console.log(error);
      });
  }

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      {myQueue.position === -1 ? (
        <div className="bg-sage-50 border-l-4 border-sage-300 text-sage-700 p-6 rounded-lg mt-8">
          <p className="font-medium">You're currently not in any queue.</p>
        </div>
      ) : (
        <div className="border-2 border-sage-400 rounded-xl shadow-lg overflow-hidden">
          {showConfetti && (
            <Confetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={false}
              numberOfPieces={800}
              gravity={0.2}
            />
          )}
          
          {/* Header */}
          <div className="bg-sage-500 px-6 py-4 border-b-2 border-sage-600">
            <h3 className="text-xl font-semibold">
              {myQueue.eventTitle} Queue
            </h3>
          </div>
  
          {/* Body */}
          <div className="p-6 md:p-8">
            <div className="space-y-6 mb-6">
              {/* Position Section */}
              <div className="flex items-center gap-2">
                <span className="text-sage-700 font-medium">Your Position:</span>
                <span className="text-2xl md:text-3xl font-bold">
                  {myQueue.positionRank}
                </span>
                {showPositionArrow && (
                  <FiArrowUp className="text-sage-500 h-6 w-6 animate-bounce" />
                )}
              </div>
  
              {/* Wait Time Section */}
              <div className="flex items-center gap-2">
                <span className="text-sage-700 font-medium">Estimated Wait:</span>
                <span className="text-2xl md:text-3xl font-bold">
                  {myQueue.timeTillYourTurn} minute(s)
                </span>
                {showWaitTimeArrow && (
                  <FiArrowUp className="text-sage-500 h-6 w-6 animate-bounce" />
                )}
              </div>
  
              {myQueue.position !== 1 ? (
                <DidYouKnowSlider />
              ) : (
                <div className="bg-sage-500  p-4 rounded-lg flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <p>
                    You're next in line! Thanks for using SwiftLine ⚡
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );


  
};

export default MyQueue;
