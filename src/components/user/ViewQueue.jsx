import React, { useEffect, useState } from 'react'
import { Container, Table, Button, Card } from 'react-bootstrap';
import { eventQueueInfo } from '../../services/swiftlineService';

const ViewQueue = ({ event, onSkip }) => {

    const [queue, setQueues] = useState([])

    useEffect(() => {
        getEventQueues();
      },[])
      
      function getEventQueues(){
        console.log("event Id: ", event)
        eventQueueInfo(event.id).then((response) => {
            console.log("eventQueueInfo: ", response.data.data)
            setQueues(response.data.data);
        }).catch((error) => {
          console.log(error);
        })
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
                          <Button variant="warning" onClick={() => onSkip(user.id)}>
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

