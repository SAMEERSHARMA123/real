import React from 'react';
import { FaHome, FaUser, FaChartBar, FaWallet, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user authentication token
    localStorage.removeItem('token'); 
    // Clear all session data
    sessionStorage.clear();
    // Redirect to login page
    navigate('/login');
    // Close sidebar if it's open
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[55] md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[55]
          md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 pt-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-purple-600">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <span className="block w-6 h-0.5 bg-gray-600 transform rotate-45 translate-y-0.5"></span>
              <span className="block w-6 h-0.5 bg-gray-600 transform -rotate-45 -translate-y-0.5"></span>
            </button>
          </div>

          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
              onClick={e => {
                e.preventDefault();
                navigate('/');
                if (onClose) onClose();
              }}
            >
              <FaHome className="text-xl" />
              <span>Home</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
              onClick={e => {
                e.preventDefault();
                navigate('/profile');
                if (onClose) onClose();
              }}
            >
              <FaUser className="text-xl" />
              <span>Profile</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <FaQuestionCircle className="text-xl" />
              <span>Help</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <FaCog className="text-xl" />
              <span>Settings</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <FaSignOutAlt className="text-xl" />
              <span>Logout</span>
            </a>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 