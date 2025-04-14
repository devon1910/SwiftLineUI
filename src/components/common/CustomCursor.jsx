import { useEffect } from "react";

export const CustomCursor = () => {
    useEffect(() => {
      const moveCursor = (e) => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
      };
  
      document.addEventListener('mousemove', moveCursor);
      return () => document.removeEventListener('mousemove', moveCursor);
    }, []);
  
    return <div className="custom-cursor" />;
  };

  