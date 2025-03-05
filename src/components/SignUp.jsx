import React, { useState } from "react";
import { Button, InputGroup } from "react-bootstrap";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";
import Form from "react-bootstrap/Form";

const SignUp = () => {
  const [email, setEmail]= useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  function handleSubmit(e) {
    e.preventDefault();
    console.log()
    validateInput();
  }

  function validateInput() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
    }
  }

  return (
    <div>
      <Form onSubmit={handleSubmit}>
      <h3>Sign Up</h3>

        <Form.Group className="mb-3">
          <Form.Floating>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              id="floatingEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingEmail">Email address</label>
          </Form.Floating>
        </Form.Group>

        
        <Form.Group className="mb-3">
          <Form.Floating>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              id="floatingPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="floatingPassword">Password</label>
            <InputGroup.Text
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                cursor: "pointer", 
                zIndex: 5 
              }}
            >
              {showPassword ? <EyeSlashFill /> : <Eye />}
            </InputGroup.Text>
          </Form.Floating>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Floating>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder=" Confirm Password"
              id="floatingConfirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="floatingConfirmPassword">Confirm Password</label>
            <InputGroup.Text
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                cursor: "pointer", 
                zIndex: 5 
              }}
            >
              {showConfirmPassword ? <EyeSlashFill /> : <Eye />}
            </InputGroup.Text>
          </Form.Floating>
        </Form.Group>

        <Button
          type="submit"
          className="btn btn-primary mt-3"
          onClick={handleSubmit}
        >
          Sign Up
        </Button>
      </Form>  
    </div>
  );
};

export default SignUp;
