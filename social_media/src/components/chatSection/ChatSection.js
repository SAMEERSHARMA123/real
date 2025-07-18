import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatOptions from './ChatOptions';
import { useChat } from '../../context/ChatContext';

const ChatSection = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { isAnimating } = useChat();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={`chat-section h-[calc(100vh-4rem)] flex flex-col transform transition-all duration-300 ease-in-out ${
      isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
    }`}>
      <div className="chat-content flex flex-col h-full relative">
        {/* ChatOptions - Always on top */}
        <div className="flex-none z-10 relative">
          <ChatOptions activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        
        {/* ChatList - Below ChatOptions */}
        <div className="flex-1 overflow-hidden mt-4 md:mt-0 relative z-0">
          <ChatList activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default ChatSection; 