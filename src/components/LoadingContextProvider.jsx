import axios from 'axios';
import { useState, useEffect, createContext, useContext } from 'react';
import { GlobalSpinner } from './GlobalSpinner';

// Create a loading context
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {}
});

// Create a provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        setPendingRequests(prev => prev + 1);
        setIsLoading(true);
        return config;
      },
      error => {
        setPendingRequests(prev => Math.max(0, prev - 1));
        if (pendingRequests <= 1) setIsLoading(false);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      response => {
        setPendingRequests(prev => Math.max(0, prev - 1));
        if (pendingRequests <= 1) setIsLoading(false);
        return response;
      },
      error => {
        setPendingRequests(prev => Math.max(0, prev - 1));
        if (pendingRequests <= 1) setIsLoading(false);
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [pendingRequests]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <GlobalSpinner />}
    </LoadingContext.Provider>
  );
};
