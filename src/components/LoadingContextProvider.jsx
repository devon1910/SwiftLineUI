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
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const handleRequest = (config) => {
      setPendingRequests(prev => prev + 1);
      return config;
    };

    const handleError = (error) => {
      setPendingRequests(prev => Math.max(0, prev - 1));
      return Promise.reject(error);
    };

    const handleResponse = (response) => {
      setPendingRequests(prev => Math.max(0, prev - 1));
      return response;
    };

    // Add interceptors
    const reqInterceptor = axios.interceptors.request.use(handleRequest, handleError);
    const resInterceptor = axios.interceptors.response.use(handleResponse, handleError);

    return () => {
      // Remove interceptors
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []); // Empty dependency array ensures stable interceptors

  const isLoading = pendingRequests > 0;

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
      {isLoading && <GlobalSpinner />}
    </LoadingContext.Provider>
  );
};
