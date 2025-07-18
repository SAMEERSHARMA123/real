// ReceiveCall.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { GetTokenFromCookie } from '../getToken/GetToken';

const socket = io("http://localhost:5000"); // backend socket server

const ReceiveCall = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("incoming-call", ({ callerID, roomID }) => {
      setIncomingCall({ callerID, roomID });
    });

    return () => socket.off("incoming-call");
  }, []);
   const decodedUser = GetTokenFromCookie();
  const acceptCall = () => {
    const calleeID = decodedUser?.id; // this user
    navigate(`/video-call?roomID=${incomingCall.roomID}&userID=${calleeID}`);
  };

  return (
    <div>
      <h2>Receive Call</h2>
      {incomingCall ? (
        <div>
          <p>📞 Incoming call from: {incomingCall.callerID}</p>
          <button onClick={acceptCall}>Accept</button>
        </div>
      ) : (
        <p>No incoming calls</p>
      )}
    </div>
  );
};

export default ReceiveCall;
