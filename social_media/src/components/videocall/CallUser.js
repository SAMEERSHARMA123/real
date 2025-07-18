// CallUser.js - This component is now deprecated
// Video calls are now initiated directly from ChatList.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CallUser = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to chat page since calls are now initiated from there
    navigate('/chat');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting...</h2>
        <p className="text-gray-500">Video calls are now initiated from the chat page.</p>
      </div>
    </div>
  );
};

export default CallUser;
