import React, { useState } from 'react'
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/swiftlineService';

const Login = () => {
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const navigator = useNavigate();
  function handleLogin(e) {
    e.preventDefault();
    const loginRequest= {email,password};
    loginUser(loginRequest)
      .then((response) => {
        console.log("response: ",response);
        navigator("/dashboard");
      })
      .catch((error) => {
        const errormsg= error.response.data.errors.join();
        console.log("error: ",error);
        alert(`${errormsg}` || error.response.data.errormsg);
      }); 
  }
  return (
    <div>
        <h3>Login</h3>
        <form>
        <FloatingLabel
            controlId="floatingEmail"
            label="Email address"
            className="mb-3">
            <Form.Control type="email" placeholder="name@example.com" onChange={(e) => setEmail(e.target.value)} />
        </FloatingLabel> 
        <FloatingLabel
            controlId="floatingPass"
            label="Password"
            className="mb-3">
            <Form.Control type="password" placeholder="" onChange={(e) => setPassword(e.target.value)} />
        </FloatingLabel>
            <button type="submit" className="btn btn-primary mt-3" onClick={handleLogin}>
            Login
            </button>
        </form>
      </div>
  )
}

export default Login