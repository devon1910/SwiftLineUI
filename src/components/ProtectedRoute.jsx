// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { getStoredAccessToken } from '../services/authStorage';

const ProtectedRoute = () => {
  const location = useLocation();
  const parentContext = useOutletContext();

  // Define routes that should bypass authentication
  const publicRoutes = ['/VerifyToken'];
  
  // Check if current path is in our public routes list
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname.startsWith(route) || location.pathname === route
  );
  
  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    return <Outlet context={parentContext} />;
  }

  const token = getStoredAccessToken();

  // If the user is not logged in, redirect to the login page.
  if (!token) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ returnTo: `${location.pathname}${location.search}` }}
      />
    );
  }

  // If the user is logged in, render the child components.
  return <Outlet context={parentContext} />;
};

export default ProtectedRoute;
