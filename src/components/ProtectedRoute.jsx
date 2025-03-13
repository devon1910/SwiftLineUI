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
