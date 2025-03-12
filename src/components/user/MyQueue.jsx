import React, { useState, useEffect, useRef } from "react";
import { Card, Alert, ProgressBar, Button } from "react-bootstrap";
import Confetti from "react-confetti";
import DidYouKnowSlider from "./DidYouKnowSlider";
import { connection } from "../../services/SignalRConn.js";
import { GetUserLineInfo } from "../../services/swiftlineService";
import LoadingSpinner from "../LoadingSpinner";

export const MyQueue = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [myQueue, setMyQueue] = useState({});

  useEffect(() => {
    getCurrentPosition();
    setIsLoading(false);
  }, []);


  const calculateProgress = (position) => {
    if (position <= 1) return 100;
    return Math.min(Math.floor(100 / position), 99);
  };

  const progress = calculateProgress(myQueue.position);
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
    <div style={{
      fontFamily: 'Inter, sans-serif',
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '0 1rem'
    }}>
      {myQueue.position === -1 ? (
        <Alert variant="warning" style={{
          backgroundColor: '#F5F7F5',
          borderColor: '#8A9A8B',
          color: '#606F60',
          borderRadius: '8px',
          padding: '1.5rem'
        }}>
          You're currently not in any queue.
        </Alert>
      ) : (
        <Card style={{
          border: '2px solid #8A9A8B',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          {showConfetti && (
            <Confetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={false}
              numberOfPieces={800}
              gravity={0.2}
              //colors={['#8A9A8B', '#C8D5C8', '#606F60']} // Sage-themed confetti
            />
          )}
          
          <Card.Header style={{
            backgroundColor: '#8A9A8B',
            padding: '1.5rem',
            borderBottom: '2px solid #6B7D6B'
          }}>
            <h3 style={{
              color: 'white',
              margin: 0,
              fontWeight: 600,
              fontSize: '1.5rem'
            }}>
              {myQueue.eventTitle} Queue
            </h3>
          </Card.Header>
  
          <Card.Body style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  color: '#606F60',
                  marginRight: '0.5rem'
                }}>
                  Your Position:
                </span>
                <strong style={{ fontSize: '1.4rem', color: '#000' }}>
                  {myQueue.positionRank}
                </strong>
                {showPositionArrow && (
                  <span style={{
                    color: '#8A9A8B',
                    fontSize: '1.5rem',
                    marginLeft: '0.5rem',
                    animation: 'bounce 0.5s infinite alternate'
                  }}>
                    ↑
                  </span>
                )}
              </div>
  
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  color: '#606F60',
                  marginRight: '0.5rem'
                }}>
                  Estimated Wait:
                </span>
                <strong style={{ fontSize: '1.4rem', color: '#000' }}>
                  {myQueue.timeTillYourTurn} minute(s)
                </strong>
                {showWaitTimeArrow && (
                  <span style={{
                    color: '#8A9A8B',
                    fontSize: '1.5rem',
                    marginLeft: '0.5rem',
                    animation: 'bounce 0.5s infinite alternate'
                  }}>
                    ↑
                  </span>
                )}
              </div>
  
              {progress < 100 ? (
                <>
                  <div style={{
                    height: '20px',
                    backgroundColor: '#E0E6DF',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '2rem'
                  }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: '#8A9A8B',
                        transition: 'width 0.5s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '8px',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.9rem'
                      }}
                    >
                      {Math.floor(progress)}%
                    </div>
                  </div>
                  <DidYouKnowSlider />
                </>
              ) : (
                <Alert variant="success" style={{
                  backgroundColor: '#8A9A8B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem'
                }}>
                  <span style={{ fontSize: '1.4rem' }}>🎉</span>
                  You're next in line! Thanks for using SwiftLine ⚡
                </Alert>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
  
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );


  
};

export default MyQueue;
