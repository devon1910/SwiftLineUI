// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Assume the user object is stored in localStorage under 'user'
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  // If the user is not logged in, redirect to the login page.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If the user is logged in, render the child components.
  return <Outlet />;;
};

export default ProtectedRoute;
