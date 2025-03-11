import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap';
import styled from "styled-components";
import { Card as BootstrapCard, Button as BootstrapButton } from "react-bootstrap";

const DashboardRow = styled(Row)`
  margin-top: 2rem;
`;

// Styled Card with a soft shadow, rounded corners, and a hover lift effect.
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

// Styled button for primary actions using SwiftLine sage green.
const StyledButtonPrimary = styled(BootstrapButton)`
  background-color: #698474;
  border: none;
  font-family: "Inter", sans-serif;
  &:hover {
    background-color: #556c60;
  }
`;

// Styled button for secondary actions using black.
const StyledButtonSecondary = styled(BootstrapButton)`
  background-color: black;
  border: none;
  font-family: "Inter", sans-serif;
  &:hover {
    background-color: #333;
  }
`;

const Dashboard = ({ onPageChange }) => {
  return (
    <DashboardRow>
      <Col md={6}>
        <StyledCard className="mb-3">
          <BootstrapCard.Body>
            <BootstrapCard.Title>Create New Event</BootstrapCard.Title>
            <BootstrapCard.Text>
              Manage and monitor your own event queues.
            </BootstrapCard.Text>
            <StyledButtonPrimary onClick={() => onPageChange("myevents")}>
              Go to My Events
            </StyledButtonPrimary>
          </BootstrapCard.Body>
        </StyledCard>
      </Col>
      <Col md={6}>
        <StyledCard className="mb-3">
          <BootstrapCard.Body>
            <BootstrapCard.Title>Join a Queue</BootstrapCard.Title>
            <BootstrapCard.Text>
              Search for active events and join the queue.
            </BootstrapCard.Text>
            <StyledButtonSecondary onClick={() => onPageChange("search")}>
              Search Events
            </StyledButtonSecondary>
          </BootstrapCard.Body>
        </StyledCard>
      </Col>
    </DashboardRow>
  );
};

export default Dashboard;



