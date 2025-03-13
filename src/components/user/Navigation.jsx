import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { FiMoon, FiSun } from 'react-icons/fi';

const Navigation = ({ onPageChange, darkMode,toggleDarkMode  }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const handlePageChange = (page) => {
    onPageChange(page);
    setActivePage(page);
    setIsOpen(false);
  };

  // Common button styles
  const menuButtonStyles = (isActive) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-sage-600 text-white dark:bg-sage-700' 
        : `text-gray-700 hover:bg-sage-50 dark:text-gray-300 dark:hover:bg-sage-900 dark:hover:text-white ${
            darkMode ? 'hover:bg-opacity-10' : ''
          }`
    }`;

    return (
      <nav className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-sm border-b border-opacity-10 backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  className="h-8 w-auto" 
                  src="src/assets/swifline_logo.webp" 
                  alt="Swiftline" 
                />
                <span className={`ml-2 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} hidden sm:block`}>
                  Swiftline
                </span>
              </div>
            </div>
    
            {/* Right side - Navigation items and buttons */}
            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {['dashboard', 'search', 'myevents', 'myqueue'].map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={menuButtonStyles(activePage === page)}
                  >
                    {page === 'dashboard' && 'Dashboard'}
                    {page === 'search' && 'Search Events'}
                    {page === 'myevents' && 'My Events'}
                    {page === 'myqueue' && 'My Queue'}
                  </button>
                ))}
              </div>
    
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
              >
                {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
              </button>
    
              {/* Mobile Menu Button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`p-2 rounded-md ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-sage-100'
                  } focus:outline-none focus:ring-2 focus:ring-sage-500`}
                >
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
    
          {/* Mobile Menu */}
          {isOpen && (
            <div className={`md:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                {['dashboard', 'search', 'myevents', 'myqueue'].map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activePage === page
                        ? 'bg-sage-600 text-white dark:bg-sage-700'
                        : `${
                            darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700 hover:bg-sage-50'
                          }`
                    }`}
                  >
                    {page === 'dashboard' && 'Dashboard'}
                    {page === 'search' && 'Search Events'}
                    {page === 'myevents' && 'My Events'}
                    {page === 'myqueue' && 'My Queue'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
};
export default Navigation;



// const Navigation = ({onPageChange} ) => {

//     return (
//         <Navbar bg="light" expand="lg">
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="mr-auto">
//               <Nav.Link onClick={() => onPageChange("dashboard")}>
//                 Dashboard
//               </Nav.Link>
//               <Nav.Link onClick={() => onPageChange("search")}>
//                 Search Events
//               </Nav.Link>
//               <Nav.Link onClick={() => onPageChange("myevents")}>
//                 My Events
//               </Nav.Link>
//               <Nav.Link onClick={() => onPageChange("myqueue")}>
//                 My Queue
//               </Nav.Link>
//             </Nav>
//           </Navbar.Collapse>
//         </Navbar>
//       );
// }