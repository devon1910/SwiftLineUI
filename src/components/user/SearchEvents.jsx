import React, { useEffect, useState } from "react";
import {
  Button as BootstrapButton,
  Card as BootstrapCard,
  Col,
  Form,
  Row,
} from "react-bootstrap";
import styled from "styled-components";
import { connection } from "../../services/SignalRConn.js";
import LoadingSpinner from "../LoadingSpinner";
import { GetUserQueueStatus } from "../../services/swiftlineService";
import { toast } from "react-toastify";

// Styled heading with SwiftLine typography
const StyledHeading = styled.h2`
  margin-top: 2rem;
  text-align: center;
  font-family: "Inter", sans-serif;
  color: black;
`;

// Styled form control with a sage green border and focus effect
const StyledFormControl = styled(Form.Control)`
  border: 2px solid #698474;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  &:focus {
    border-color: #698474;
    box-shadow: 0 0 5px rgba(105, 132, 116, 0.3);
  }
`;

// Styled card with smooth hover lift and flat design
const StyledCard = styled(BootstrapCard)`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  border: none;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
  }
`;

// Styled button using SwiftLine sage green and flat style
const StyledButton = styled(BootstrapButton)`
  background-color: #698474;
  border: none;
  font-family: "Inter", sans-serif;
  &:hover {
    background-color: #556c60;
  }
`;

export const SearchEvents = ({ events, onPageChange, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserInQueue, setIsUserInQueue] = useState(true);
 // const [isLoading, setIsLoading] = useState(true);

  // Filter events based on the search term
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  useEffect(() => {
    getUserQueueStatus();
    //setIsLoading(false);
  }, []);

  function getUserQueueStatus() {
    GetUserQueueStatus()
      .then((response) => {
        setIsUserInQueue(response.data.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        console.log(error);
      });
  }

  // Styles for active/inactive status dot
  const activeDotStyle = {
    width: "10px",
    height: "10px",
    backgroundColor: "#698474", // SwiftLine sage green
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
    animation: "beep 1.5s infinite",
  };

  const inactiveDotStyle = {
    width: "10px",
    height: "10px",
    backgroundColor: "#bdc3c7", // Neutral gray
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px",
  };

  const joinQueue = async (event) => {
    const eventId = event.id;

    // Reconnect if SignalR connection is lost
    if (connection.state !== "Connected") {
      toast.info("Connection lost. Attempting to reconnect...");
      try {
        await connection.start();
        toast.success("Reconnected successfully.");
      } catch (reconnectError) {
        console.error("Reconnection failed:", reconnectError);
        toast.error("Unable to reconnect. Please check your network.");
        return;
      }
    }

    // Invoke SignalR method to join the queue
    connection
      .invoke("JoinQueueGroup", eventId, userId)
      .then(() => {
        toast.success("Joined queue successfully.");
        onPageChange("myqueue");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error joining queue. Please try again.");
      });
  };

  // if (isLoading) {
  //   return <LoadingSpinner message="Loading..." />;
  // }
  const StatItem = ({ label, value }) => (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      padding: '0.5rem',
      borderRadius: '4px',
      backgroundColor: '#F5F7F5' // Very light sage background
    }}>
      <span style={{ 
        fontSize: "0.75rem",
        color: "#606F60", // Dark sage
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "1.1rem",
        fontWeight: 500,
        color: "#000000" // Black
      }}>
        {value}
      </span>
    </div>
  );
  return (
    <div>
      <StyledHeading>Search Events</StyledHeading>
      <Form>
        <Form.Group controlId="search">
          <StyledFormControl
            type="text"
            placeholder="Search for events by their titles"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </Form>
      <br />
      <Row>
        {filteredEvents.map((event) => (
          <Col md={4} key={event.id} className="mb-3">
            <StyledCard
              style={{
                border: "1px solid #8A9A8B", // Sage green border
                borderRadius: "8px",
                backgroundColor: "white",
              }}
            >
              {/* Status dot */}
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  zIndex: 1,
                }}
              >
                <span
                  style={
                    event.isActive
                      ? {
                          ...activeDotStyle,
                          backgroundColor: "#8A9A8B", // Sage green
                        }
                      : {
                          ...inactiveDotStyle,
                          backgroundColor: "#C8D5C8", // Muted sage
                        }
                  }
                />
              </div>

              <BootstrapCard.Body
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {/* Title Section */}
                <BootstrapCard.Title
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#000000", // Black
                  }}
                >
                  {event.title}
                </BootstrapCard.Title>

                {/* Description */}
                <BootstrapCard.Text
                  style={{
                    color: "#606F60", // Dark sage
                    fontSize: "0.9rem",
                    lineHeight: 1.4,
                    marginBottom: "0.5rem",
                  }}
                >
                  {event.description}
                </BootstrapCard.Text>

                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <StatItem
                    label="Average Wait"
                    value={`${event.averageTime} mins`}
                  />
                  <StatItem label="Users in Queue" value={event.usersInQueue} />
                  <StatItem label="Start Time" value={event.eventStartTime} />
                  <StatItem label="End Time" value={event.eventEndTime} />
                </div>

                {/* Organizer */}
                <BootstrapCard.Text
                  style={{
                    fontSize: "0.85rem",
                    color: "#8A9A8B", // Sage green
                    opacity: 0.9,
                    fontStyle: "italic",
                  }}
                >
                  Organized by: {event.createdBy}
                </BootstrapCard.Text>

                {/* Join Button */}
                <StyledButton
                  disabled={isUserInQueue}
                  onClick={() => joinQueue(event)}
                  style={{
                    marginTop: "1rem",
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                    backgroundColor: isUserInQueue ? "#E0E6DF" : "#8A9A8B", // Sage green
                    color: isUserInQueue ? "#606F60" : "white",
                    border: "none",
                    transition: "all 0.2s ease",
                    "&:hover:not(:disabled)": {
                      backgroundColor: "#6B7D6B", // Darker sage
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {isUserInQueue ? "Already in Queue" : "Join Queue"}
                </StyledButton>
              </BootstrapCard.Body>
            </StyledCard>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SearchEvents;
