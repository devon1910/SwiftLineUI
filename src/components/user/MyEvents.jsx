import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap';

const MyEvents = ({ events, onPageChange }) => {
  return (
    <div style={{ 
      padding: '2rem',
      backgroundColor: '#F5F7F5', // Light sage background
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            color: '#2D3748', 
            fontWeight: 600,
            margin: 0
          }}>
            My Events
          </h2>
          <Button 
            onClick={() => onPageChange("eventForm")}
            style={{
              backgroundColor: '#8A9A8B',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#6B7D6B',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Create New Event
          </Button>
        </div>
  
        {/* Events Grid */}
        <Row className="g-4">
          {events.map(event => (
            <Col md={4} key={event.id}>
              <Card style={{ 
                border: '1px solid #8A9A8B',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
              }}>
                <Card.Body style={{ padding: '1.5rem' }}>
                  <Card.Title style={{ 
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}>
                    {event.title}
                  </Card.Title>
                  <Card.Text style={{ 
                    color: '#606F60',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    minHeight: '60px',
                    marginBottom: '1.5rem'
                  }}>
                    {event.description}
                  </Card.Text>
  
                  {/* Buttons Container */}
                  <div style={{ 
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between'
                  }}>
                    <Button
                      variant="outline" 
                      onClick={() => onPageChange("queueManagement", event)}
                      style={{
                        flex: 1,
                        borderColor: '#8A9A8B',
                        color: '#8A9A8B',
                        borderRadius: '6px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        ':hover': {
                          backgroundColor: '#8A9A8B',
                          color: 'white'
                        }
                      }}
                    >
                      View Queue
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onPageChange("eventForm", event)}
                      style={{
                        flex: 1,
                        borderColor: '#C8D5C8',
                        color: '#606F60',
                        borderRadius: '6px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        ':hover': {
                          backgroundColor: '#E0E6DF',
                          borderColor: '#8A9A8B'
                        }
                      }}
                    >
                      Edit Event
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
export default MyEvents

