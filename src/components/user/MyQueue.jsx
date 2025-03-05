import React from 'react'
import { Button,Alert } from 'react-bootstrap';
export const MyQueue = ({ myQueue, events }) => {
    const event = events.find(ev => ev.id === myQueue.eventId);
    if (!event) {
      return <Alert variant="warning" className="mt-4">No event found for your queue.</Alert>;
    }
    return (
        <div className="mt-4">
          <h2>{event.title} Queue</h2>
          <p>Your Position: {myQueue.position}</p>
          <p>Estimated Wait Time: {myQueue.estimatedWait} mins</p>
          <Button variant="primary" onClick={() => alert('Queue refresh simulation')}>
            Refresh
          </Button>
        </div>
      );
}

export default MyQueue



