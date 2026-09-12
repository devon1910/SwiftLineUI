// ThemeContext.js
import React, { useEffect } from 'react';
import ThemeContext from './ThemeContext.js'; // Adjust the import path as necessary
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    document.body.classList.add("dark-mode");
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

