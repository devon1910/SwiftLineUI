import { useEffect, useState} from 'react';
import GlobalSpinner from './GlobalSpinner';
import API from '../../services/api/APIService';
import { LoadingContext } from '../../services/context/LoadingContext';

export const LoadingProvider = ({ children }) => {
  const [pendingOperations, setPendingOperations] = useState(0);
  
  const startOperation = () => setPendingOperations(prev => prev + 1);
  const endOperation = () => setPendingOperations(prev => Math.max(0, prev - 1));
  useEffect(() => {
        const handleRequest = (config) => {
          setPendingOperations(prev => prev + 1);
          return config;
        };
    
        const handleError = (error) => {
          setPendingOperations(prev => Math.max(0, prev - 1));
          return Promise.reject(error);
        };
    
        const handleResponse = (response) => {
          setPendingOperations(prev => Math.max(0, prev - 1));
          return response;
        };
    
        // Add interceptors
        const reqInterceptor = API.interceptors.request.use(handleRequest, handleError);
        const resInterceptor = API.interceptors.response.use(handleResponse, handleError);
    
        return () => {
          // Remove interceptors
          API.interceptors.request.eject(reqInterceptor);
          API.interceptors.response.eject(resInterceptor);
        };
      }, []); // Empty dependency array ensures stable interceptors
    
  return (
    <LoadingContext.Provider value={{ startOperation, endOperation }}>
      {children}
      {pendingOperations > 0 && <GlobalSpinner />}
    </LoadingContext.Provider>
  );
};

// export const LoadingProvider = ({ children }) => {
//   const [pendingRequests, setPendingRequests] = useState(0);

//   useEffect(() => {
//     const handleRequest = (config) => {
//       setPendingRequests(prev => prev + 1);
//       return config;
//     };

//     const handleError = (error) => {
//       setPendingRequests(prev => Math.max(0, prev - 1));
//       return Promise.reject(error);
//     };

//     const handleResponse = (response) => {
//       setPendingRequests(prev => Math.max(0, prev - 1));
//       return response;
//     };

//     // Add interceptors
//     const reqInterceptor = API.interceptors.request.use(handleRequest, handleError);
//     const resInterceptor = API.interceptors.response.use(handleResponse, handleError);

//     return () => {
//       // Remove interceptors
//       API.interceptors.request.eject(reqInterceptor);
//       API.interceptors.response.eject(resInterceptor);
//     };
//   }, []); // Empty dependency array ensures stable interceptors

//   const isLoading = pendingRequests > 0;

//   return (
//     <LoadingContext.Provider value={{ isLoading }}>
//       {children}
//       {isLoading && <GlobalSpinner />}
//     </LoadingContext.Provider>
//   );
// };


