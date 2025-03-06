import React, { useEffect, useState } from 'react'
import { Button,Alert, Card, ProgressBar } from 'react-bootstrap';

import DidYouKnowSlider from './DidYouKnowSlider';
export const MyQueue = ({ myQueue, events }) => {
    const event = events.find(ev => ev.id === myQueue.eventId);

    // Simulation factor: For demo, 1 minute = 5 seconds of simulation time.
    const simulationFactor = 5; 
    const totalSimTime = myQueue.estimatedWait * simulationFactor; // Total simulation time in seconds

    // State to track elapsed simulation time in seconds.
    const [elapsedTime, setElapsedTime] = useState(0);

    // Compute progress percentage (capped at 100%).
    const progress = Math.min((elapsedTime / totalSimTime) * 100, 100);

    // useEffect sets up an interval to update the elapsed time every second.
    useEffect(() => {
      // Reset timer if myQueue changes
      setElapsedTime(0);
      const interval = setInterval(() => {
        setElapsedTime(prevTime => {
          if (prevTime < totalSimTime) {
            return prevTime + 1;
          } else {
            clearInterval(interval);
            return prevTime;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [myQueue, totalSimTime]);

    if (!event) {
      return <Alert variant="warning" className="mt-4">You're currently not on any Queue at the moment.</Alert>;
    }
    return (
      <Card className="mt-4">
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
            You're next in line! thanks for using SwiftLine ⚡😁
          </Alert>
        )}
        <Button variant="primary" onClick={() => alert('Queue refresh simulation')}>
          Refresh
        </Button>
      </Card.Body>
    </Card>
      );
}

export default MyQueue



