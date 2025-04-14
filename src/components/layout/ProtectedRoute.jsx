// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {

  // Define routes that should bypass authentication
  const publicRoutes = ['/VerifyToken'];
  
  // Check if current path is in our public routes list
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname.startsWith(route) || location.pathname === route
  );
  
  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    return <Outlet />;
  }

  const userToken = localStorage.getItem('user') === "undefined" ? null : localStorage.getItem('user');
  // Get token from localStorage
  const token = userToken 
    ? JSON.parse(userToken) 
    : null;

  // If the user is not logged in, redirect to the login page.
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // If the user is logged in, render the child components.
  return <Outlet />;
};

export default ProtectedRoute;
