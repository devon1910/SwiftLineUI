import React from 'react'
import { Container, Table, Button, Card } from 'react-bootstrap';

const ViewQueue = ({ event, queue, onSkip }) => {
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
                        <td>{user.name}</td>
                        <td>{user.joinTime}</td>
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


