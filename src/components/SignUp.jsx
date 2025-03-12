import React, { useState } from "react";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import styled from "styled-components";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import { SignUpUser } from "../services/swiftlineService";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";

// Wrapper to center the signup card vertically and horizontally
const SignUpWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
`;

// Card styling for the signup form
const SignUpCard = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 400px;
  position: relative;
`;

// Title styling for the form
const FormTitle = styled.h3`
  font-family: "Inter", sans-serif;
  color: black;
  margin-bottom: 20px;
  text-align: center;
`;

// Styled floating input group for spacing and alignment
const StyledFormFloating = styled(Form.Floating)`
  margin-bottom: 20px;
`;

// Input styling with sage green borders and focus effects
const StyledFormControl = styled(Form.Control)`
  border: 2px solid #698474;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  &:focus {
    border-color: #698474;
    box-shadow: 0 0 5px rgba(105, 132, 116, 0.3);
  }
`;

// Icon styling for toggling password visibility
const ToggleIcon = styled(InputGroup.Text)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 5;
  background-color: transparent;
  border: none;
`;

// Styled submit button using SwiftLine's signature sage green
const StyledButton = styled(Button)`
  background-color: #698474;
  border: none;
  font-family: "Inter", sans-serif;
  width: 100%;
  margin-top: 20px;
  &:hover {
    background-color: #556c60;
  }
`;

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true)
    const signUpRequest = { email, password };
    SignUpUser(signUpRequest)
      .then((response) => {
        console.log("response: ", response);
        setIsFormSubmitted(true);
        setIsLoading(false)
        console.log("isFormSubmitted", isFormSubmitted)
      })
      .catch((error) => {
        if (error.data) {
          console.log("error: ", error.message);
          toast.error(error.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setIsLoading(false)
      });
  }

  return(<SignUpWrapper>
    {isLoading && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.5 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          zIndex: 1000
        }}
      >
        <LoadingSpinner message="Loading..." />
      </motion.div>
    )}
    
    <SignUpCard>
      {isFormSubmitted ? (
        <Alert
          variant="success"
          style={{
            backgroundColor: "#8A9A8B",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          Almost done! a welcome mail has been sent to your email address, kindly follow the instructions. Didn't get it in your inbox? please check your spam folder or contact the support team. Thanks!🙂
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          <FormTitle>Sign Up</FormTitle>
          <StyledFormFloating className="mb-3">
            <StyledFormControl
              type="email"
              placeholder="name@example.com"
              id="floatingEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingEmail">Email address</label>
          </StyledFormFloating>

          <StyledFormFloating className="mb-3">
            <StyledFormControl
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              id="floatingPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="floatingPassword">Password</label>
            <ToggleIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeSlashFill /> : <Eye />}
            </ToggleIcon>
          </StyledFormFloating>

          <StyledButton type="submit" variant="primary">
            Sign Up
          </StyledButton>
        </Form>
      )}
    </SignUpCard>
  </SignUpWrapper>
 )
  
};

export default SignUp;
