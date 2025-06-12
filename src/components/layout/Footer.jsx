import React from "react";
import { Link } from "react-router-dom"; // Import Link
import { useFeedback } from "../../services/utils/useFeedback";
import { useTheme } from "../../services/utils/useTheme"; // Import useTheme for consistency

export const Footer = () => {
  const { triggerFeedback } = useFeedback();
  const { darkMode } = useTheme(); // Use the theme hook for footer styling

  const footerBgClass = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const footerBorderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const copyrightBgClass = darkMode ? 'bg-black text-gray-400' : 'bg-black text-white';
  const linkClass = darkMode ? '!text-sage-400  hover:!text-sage-300' : '!text-sage-500 hover:!text-sage-600';

  return (
    <footer className={`${footerBgClass} ${footerBorderClass} border-t mt-auto transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 text-center text-sm">
        {/* Navigation links in footer */}
        <div className="flex justify-center space-x-6 mb-6">
          <Link to="/about" className={`${linkClass} font-medium no-underline`} style={{ color: 'inherit' }}>About</Link>
          <Link to="/faq" className={`${linkClass} font-medium no-underline`} style={{ color: 'inherit' }}>FAQs</Link> 
          <Link to="/howitworks" className={`${linkClass} font-medium no-underline`} style={{ color: 'inherit' }}>How It Works</Link>
        </div>

        {/* Feedback Button */}
        <button
          onClick={() => triggerFeedback(null)}
          className="bg-sage-500 hover:bg-sage-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-opacity-75 animate-pulse transition duration-200 ease-in-out"
        >
          Give Feedback
        </button>

        {/* Copyright - visible on all screen sizes */}
        <div className={`${copyrightBgClass} py-3 mt-6 rounded-md`}> {/* Added mt-6 and rounded-md for separation */}
          <p className="text-xs">
            © {new Date().getFullYear()} <span className="font-bold">theswiftline</span>. All rights reserved. Created by{" "}
             <Link 
              className={`${linkClass} font-medium no-underline`} 
              style={{ color: 'inherit' }} 
              to="https://davidson-portfolio-davidsons-projects-2757da45.vercel.app/"
              target="_blank" 
              rel="noopener noreferrer">Davidson Ekpokpobe</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;