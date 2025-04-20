// ThemeContext.js
import React, { useState, useEffect } from 'react';
import ThemeContext from './ThemeContext.js'; // Adjust the import path as necessary
export function ThemeProvider({ children }) {
  // Initialize theme state from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("darkMode");
      return savedTheme === "true";
    } catch (err) {
      console.error("Failed to access localStorage:", err);
      return false;
    }
  });

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      try {
        localStorage.setItem("darkMode", newMode.toString());
      } catch (err) {
        console.error("Failed to update localStorage:", err);
      }
      return newMode;
    });
  };

  // Update localStorage whenever darkMode changes
  useEffect(() => {
    try {
      localStorage.setItem("darkMode", darkMode.toString());
    } catch (err) {
      console.error("Failed to update localStorage:", err);
    }
  }, [darkMode]);

  // Helper function for theme classes
  const getThemeClass = (darkClass, lightClass) => darkMode ? darkClass : lightClass;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, getThemeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}

