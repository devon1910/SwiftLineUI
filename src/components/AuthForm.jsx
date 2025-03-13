import React, { useState } from "react";
import styled from "styled-components";
import Login from "./Login";
import SignUp from "./SignUp";

const AuthSection = styled.section`
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  background-color: #f9f9f9;
`;

const AuthContainer = styled.div`
  width: 46rem;
  margin-top: 3rem;
`;

const NavTabs = styled.ul`
  display: flex;
  list-style: none;
  border-bottom: 2px solid #ccc;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-right: 1rem;
`;

const NavLink = styled.button`
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-family: "Inter", sans-serif;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: black;
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border-color: #698474;
  }

  &.active {
    border-color: #698474;
    font-weight: 600;
  }
`;

const TabContent = styled.div`
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-top: none;
  background-color: white;
`;

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b border-sage-200">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 p-4 text-lg font-medium transition-colors ${
              activeTab === "login"
                ? "text-sage-600 border-b-2 border-sage-600"
                : "text-gray-500 hover:bg-sage-50"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 p-4 text-lg font-medium transition-colors ${
              activeTab === "signup"
                ? "text-sage-600 border-b-2 border-sage-600"
                : "text-gray-500 hover:bg-sage-50"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "login" ? <Login /> : <SignUp />}
        </div>
      </div>
    </div>
  );
};


export default AuthForm;
