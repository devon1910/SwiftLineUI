import React, { useEffect, useState } from 'react'
import { Container, Table, Button, Card } from 'react-bootstrap';
import { eventQueueInfo } from '../../services/swiftlineService';
import LoadingSpinner from '../LoadingSpinner';
import { useLocation } from 'react-router-dom';

const ViewQueue = ({ onSkip }) => {

    const [queue, setQueues] = useState([])
    const [isLoading, setIsLoading]= useState(true);

    const location = useLocation();

    const event = location.state?.event;

    useEffect(() => {
        getEventQueues();
        
      },[])
      
      function getEventQueues(){
        eventQueueInfo(event.id).then((response) => {
            setQueues(response.data.data);
            console.log(response.data.data);
            setIsLoading(false)
        }).catch((error) => {
          console.log(error);
          setIsLoading(false)
        })
    }
      
    if (isLoading) {
        return <LoadingSpinner message="Loading..." />;
      }
    return (
        <Container className="mt-4">
          <Card>
            <Card.Header>
              <h3>{event.title}</h3>
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

