import React, { useState, useEffect } from 'react';
import { Card, Alert, ProgressBar, Button } from 'react-bootstrap';
import Confetti from 'react-confetti';
import DidYouKnowSlider from './DidYouKnowSlider';
import { lineInfo } from '../../services/swiftlineService';

export const MyQueue = ({ myQueue, events }) => {
    const event = events.find(ev => ev.id === myQueue.eventId);
    console.log("events: ",events)
    console.log("myQueue: ",myQueue)
    // Simulation factor: For demo, 1 minute = 5 seconds of simulation time.
    const simulationFactor = 5; 
    const totalSimTime = myQueue.estimatedWait * simulationFactor; // Total simulation time in seconds

    // State to track elapsed simulation time in seconds.
    const [elapsedTime, setElapsedTime] = useState(0);
    // State to control confetti display
    const [showConfetti, setShowConfetti] = useState(false);
    // State to manage window dimensions for confetti
    const [windowDimension, setWindowDimension] = useState({
      width: window.innerWidth,
      height: window.innerHeight
    });
     
    // Compute progress percentage (capped at 100%).
    const progress = Math.min((elapsedTime / totalSimTime) * 100, 100);

    //const [updatedQueue, setUpdatedQueue]= useState(myQueue)

    // Handle window resize for confetti
    useEffect(() => {
      const handleResize = () => {
        setWindowDimension({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // useEffect sets up an interval to update the elapsed time every second.
    useEffect(() => {
      // Reset timer and confetti if myQueue changes
      setElapsedTime(0);
      setShowConfetti(false);
      
      const interval = setInterval(() => {
        setElapsedTime(prevTime => {
          if (prevTime < totalSimTime) {
            return prevTime + 1;
          } else {
            // When we reach 100%, trigger confetti
            if (!showConfetti) {
              setShowConfetti(true);
              // Auto-hide confetti after 5 seconds
              setTimeout(() => setShowConfetti(false), 7000);
            }
            clearInterval(interval);
            return prevTime;
          }
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }, [myQueue, totalSimTime]);


    function getLineInfo(myQueue)
    {   
      lineInfo(myQueue)
            .then((response) => {
              console.log("eventQueueInfo-New: ", response.data.data);
              // let position= response.data.data.position
              // let estimatedWait= response.data.data.timeTillYourTurn
              // let eventId= response.data.data.eventId
              // let lineMemberId= response.data.data.lineMemberId
              //setMyQueue({ eventId: eventId, position, estimatedWait, lineMemberId });
              //onPageChange("myqueue");
            })
            .catch((error) => {
              console.log(error);
            });
    }

    if (!event) {
      return <Alert variant="warning" className="mt-4">You're currently not on any Queue at the moment.</Alert>;
    }
    
    return (
      <Card className="mt-4">
        {/* Confetti component that shows when progress reaches 100% */}
        {showConfetti && (
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.2}
          />
        )}
        <Card.Header>
          <h3>{event.title} Queue</h3>
        </Card.Header>
        <Card.Body>
          <p>Your Position: {myQueue.position}</p>
          <p>Estimated Wait Time: {myQueue.estimatedWait} mins</p>
          {progress < 100 ? (
            <>
              <ProgressBar 
                now={progress} 
                label={`${Math.floor(progress)}%`} 
                animated 
                className="mb-3" 
              />
              <DidYouKnowSlider/>
            </>       
          ) : (
            <Alert variant="success" className="mb-3" style={{ fontSize: '1.2rem' }}>
              You're next in line! Thanks for using SwiftLine ⚡😁
            </Alert>
          )}
          <Button variant="primary" onClick={() => getLineInfo({myQueue})}>
            Refresh
          </Button>
        </Card.Body>
      </Card>
    );
};

export default MyQueue