import React from 'react';

const ChatOptions = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between relative">
          {/* Back icon at the far left */}
          <div className="flex-shrink-0">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              onClick={() => window.history.back()}
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          {/* Centered chat options */}
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-50 rounded-full shadow-sm border border-gray-100 px-1.5 py-1.5 w-full sm:w-auto max-w-xs">
              <div className="flex space-x-2">
                <button 
                  onClick={() => onTabChange('all')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out w-1/2 sm:w-auto ${
                    activeTab === 'all' 
                      ? 'bg-white text-purple-600 shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  All Chats
                </button>
                <button 
                  onClick={() => onTabChange('groups')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out w-1/2 sm:w-auto ${
                    activeTab === 'groups' 
                      ? 'bg-white text-purple-600 shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Groups
                </button>
              </div>
            </div>
          </div>
          {/* Empty div for spacing on the right */}
          <div className="flex-shrink-0 w-10" />
        </div>
      </div>
    </div>
  );
};

export default ChatOptions; 