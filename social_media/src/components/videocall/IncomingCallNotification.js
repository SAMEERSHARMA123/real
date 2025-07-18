import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import socket from '../socket_io/Socket';
import { GetTokenFromCookie } from '../getToken/GetToken';

// Simple icons as fallback if heroicons don't work
const PhoneIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
  </svg>
);

const VideoCameraIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
);

const IncomingCallToast = ({ callerID, roomID, callerName, callerImage, onAccept, onDecline }) => {
  console.log('🎨 Rendering IncomingCallToast with:', { callerID, roomID, callerName });
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '16px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
      border: '1px solid #e5e7eb',
      minWidth: '320px'
    }}>
      <div style={{ flexShrink: 0, marginRight: '12px', position: 'relative' }}>
        <img
          src={callerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(callerName || callerID)}&background=6366f1&color=fff`}
          alt={callerName || callerID}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #3b82f6'
          }}
        />
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <VideoCameraIcon style={{ height: '16px', width: '16px', color: '#3b82f6', marginRight: '4px' }} />
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
            Incoming Video Call
          </p>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {callerName || callerID}
        </p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
        <button
          onClick={onDecline}
          style={{
            padding: '8px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Decline"
        >
          <XMarkIcon style={{ height: '16px', width: '16px' }} />
        </button>
        <button
          onClick={onAccept}
          style={{
            padding: '8px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Accept"
        >
          <PhoneIcon style={{ height: '16px', width: '16px' }} />
        </button>
      </div>
    </div>
  );
};

const IncomingCallNotification = () => {
  const [activeCall, setActiveCall] = useState(null);
  const navigate = useNavigate();
  const decodedUser = GetTokenFromCookie();

  useEffect(() => {
    console.log('🔧 IncomingCallNotification component mounted');
    
    const handleAcceptCall = (callerID, roomID, toastId) => {
      try {
        console.log('✅ Call accepted');
        
        // Close the toast
        toast.dismiss(toastId);
        setActiveCall(null);
        
        // Emit call accepted event
        socket.emit('call-accepted', { callerID, roomID, calleeID: decodedUser?.id });
        
        // Navigate to video call
        const calleeID = decodedUser?.id;
        navigate(`/video-call?roomID=${roomID}&userID=${calleeID}`);
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    };

    const handleDeclineCall = (callerID, roomID, toastId) => {
      try {
        console.log('❌ Call declined');
        
        // Close the toast
        toast.dismiss(toastId);
        
        // Emit call declined event
        socket.emit('call-declined', { callerID, roomID });
        
        setActiveCall(null);
      } catch (error) {
        console.error('Error declining call:', error);
      }
    };

    const handleIncomingCall = ({ callerID, roomID, callerName, callerImage }) => {
      try {
        console.log('📞 Incoming call received:', { callerID, roomID, callerName });
        
        // Store the active call info
        setActiveCall({ callerID, roomID, callerName, callerImage });
        
        // Show toast notification
        const toastId = toast(
          <IncomingCallToast
            callerID={callerID}
            roomID={roomID}
            callerName={callerName}
            callerImage={callerImage}
            onAccept={() => handleAcceptCall(callerID, roomID, toastId)}
            onDecline={() => handleDeclineCall(callerID, roomID, toastId)}
          />,
          {
            position: "top-right",
            autoClose: 30000, // 30 seconds
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            closeButton: false,
            className: "incoming-call-toast",
            bodyClassName: "p-0",
            onClose: () => {
              setActiveCall(null);
              // Emit call declined when toast auto-closes
              socket.emit('call-declined', { callerID, roomID });
            }
          }
        );
        
        console.log('📱 Toast notification shown with ID:', toastId);
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    };

    const handleCallCancelled = ({ roomID }) => {
      if (activeCall && activeCall.roomID === roomID) {
        console.log('🚫 Call was cancelled by caller');
        toast.dismiss(); // Dismiss any active toasts
        setActiveCall(null);
      }
    };

    // Listen for incoming calls and cancellations
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-cancelled', handleCallCancelled);
    console.log('👂 Listening for incoming calls...');

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up incoming call listeners');
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-cancelled', handleCallCancelled);
    };
  }, [navigate, decodedUser]);

  // Add a test button in development
  const testIncomingCall = () => {
    console.log('🧪 Testing incoming call notification');
    const testData = {
      callerID: 'test123',
      roomID: 'room_test',
      callerName: 'Test User',
      callerImage: null
    };
    
    const toastId = toast(
      <IncomingCallToast
        callerID={testData.callerID}
        roomID={testData.roomID}
        callerName={testData.callerName}
        callerImage={testData.callerImage}
        onAccept={() => console.log('Test call accepted')}
        onDecline={() => console.log('Test call declined')}
      />,
      {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        closeButton: false
      }
    );
  };

  // This component doesn't render anything visible - it just handles the toast notifications
  // In development, show a test button
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}>
        <button 
          onClick={testIncomingCall}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test Call
        </button>
      </div>
    );
  }
  
  return null;
};

export default IncomingCallNotification;