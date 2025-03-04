import React, { useState } from "react";
import { FloatingLabel } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      <h3>Sign Up</h3>
      <form>
        <FloatingLabel
          controlId="floatingEmailSignUp"
          label="Email address"
          className="mb-3"
        >
          <Form.Control type="text" placeholder="Email" />
        </FloatingLabel>
        <FloatingLabel
          controlId="floatingPassSignUp"
          label="Password"
          className="mb-3"
        >
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel
          controlId="floatingConfirmPass"
          label="Confirm Password"
          className="mb-3"
        >
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FloatingLabel>

        <button
          type="submit"
          className="btn btn-primary mt-3"
          onClick={handleSubmit}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
