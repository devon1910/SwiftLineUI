import { createContext } from "react";

// Create a loading context
export const LoadingContext = createContext({
    isLoading: false,
    setIsLoading: () => {}
  });