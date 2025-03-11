import React, { useEffect, useState } from 'react'
import { Container, Table, Button, Card } from 'react-bootstrap';
import { eventQueueInfo } from '../../services/swiftlineService';
import LoadingSpinner from '../LoadingSpinner';

const ViewQueue = ({ event, onSkip }) => {

    const [queue, setQueues] = useState([])
    const [isLoading, setIsLoading]= useState(true);

    useEffect(() => {
        getEventQueues();
        setIsLoading(false)
      },[])
      
      function getEventQueues(){
        eventQueueInfo(event.id).then((response) => {
            setQueues(response.data.data);
        }).catch((error) => {
          console.log(error);
        })
    }
      
    if (isLoading) {
        return <LoadingSpinner message="Loading..." />;
      }
    return (
        <Container className="mt-4">
          <Card>
            <Card.Header>
              <h3>{event.title} - Queue Management</h3>
            </Card.Header>
            <Card.Body>
              <Card.Text>{event.description}</Card.Text>
              {queue.length === 0 ? (
                <p>No users in the queue.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>User Name</th>
                      <th>Join Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.lineMember.swiftLineUser.email}</td>
                        <td>{user.createdAt.split('T')[1].split('.')[0]}</td>
                        <td>
                          <Button disabled={true} variant="warning" onClick={() => onSkip(user.id)}>
                            Skip
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Container>
      );
}

export default ViewQueue

