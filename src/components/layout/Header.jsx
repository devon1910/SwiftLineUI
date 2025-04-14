import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, Home, List, Clock, LogOut } from 'lucide-react';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
    
    const closeMenu = () => {
      setIsMenuOpen(false);
    };
    
    const isActive = (path) => {
      return location.pathname === path;
    };
  
    return (
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Swiftline" 
              className="h-8 md:h-10"
            />
            <span className="ml-2 text-lg font-semibold hidden md:block text-gray-900">Swiftline</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium hover:text-green-700 transition-colors ${isActive('/dashboard') ? 'text-green-700' : 'text-gray-700'}`}
            >
              Home
            </Link>
            <Link 
              to="/queue" 
              className={`text-sm font-medium hover:text-green-700 transition-colors ${isActive('/queue') ? 'text-green-700' : 'text-gray-700'}`}
            >
              My Queue
            </Link>
            <Link 
              to="/history" 
              className={`text-sm font-medium hover:text-green-700 transition-colors ${isActive('/history') ? 'text-green-700' : 'text-gray-700'}`}
            >
              History
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>
            
            <Link to="/profile" className="hidden md:flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white">
                <User size={16} />
              </div>
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md md:hidden text-gray-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white pt-16">
            <div className="container mx-auto px-4 py-6 space-y-6">
              <div className="flex items-center space-x-3 p-2">
                <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">john.doe@example.com</p>
                </div>
              </div>
              
              <div className="h-px bg-gray-200"></div>
              
              <nav className="space-y-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center p-2 space-x-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}
                >
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                <Link 
                  to="/queue" 
                  className="flex items-center p-2 space-x-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}
                >
                  <List size={20} />
                  <span>My Queue</span>
                </Link>
                <Link 
                  to="/history" 
                  className="flex items-center p-2 space-x-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}
                >
                  <Clock size={20} />
                  <span>History</span>
                </Link>
                
                <div className="h-px bg-gray-200"></div>
                
                <Link 
                  to="/profile" 
                  className="flex items-center p-2 space-x-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/logout" 
                  className="flex items-center p-2 space-x-3 text-red-600 hover:bg-red-50 rounded-md"
                  onClick={closeMenu}
                >
                  <LogOut size={20} />
                  <span>Log Out</span>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
    );
}
