import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <section className="w-100 p-4 d-flex justify-content-center pb-4">
      <div style={{ width: "46rem" }}>
        <div className="container mt-5">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}>
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => setActiveTab("signup")}>
                Sign Up
              </button>
            </li>
          </ul>
          <div className="tab-content p-3 border border-top-0">
            {activeTab === "login" && (
              <Login/>
            )}
            {activeTab === "signup" && (
              <SignUp/>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthForm;
