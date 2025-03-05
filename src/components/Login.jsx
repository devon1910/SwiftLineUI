import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/swiftlineService";
import { Button, InputGroup } from "react-bootstrap";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigator = useNavigate();
  function handleLogin(e) {
    e.preventDefault();
    const loginRequest = { email, password };
    loginUser(loginRequest)
      .then((response) => {
        console.log("response: ", response);
        navigator("/dashboard");
      })
      .catch((error) => {
        const errormsg = error.response.data.errors.join();
        console.log("error: ", error);
        alert(`${errormsg}` || error.response.data.errormsg);
      });
  }
  return (
    <div>
      <Form onSubmit={handleLogin}>
        <h3>Login</h3>

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
              }}>
              {showPassword ? <EyeSlashFill /> : <Eye />}
            </InputGroup.Text>
          </Form.Floating>
        </Form.Group>

        <Button 
          type="submit" 
          variant="primary" 
          className="mt-3">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
