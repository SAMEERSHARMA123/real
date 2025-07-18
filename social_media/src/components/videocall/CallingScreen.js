import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket_io/Socket';

const CallingScreen = ({ calleeInfo, roomID, onCallAccepted, onCallDeclined, onCancel }) => {
  const [callStatus, setCallStatus] = useState('calling'); // calling, accepted, declined, cancelled
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallAccepted = ({ roomID: acceptedRoomID }) => {
      if (acceptedRoomID === roomID) {
        setCallStatus('accepted');
        onCallAccepted && onCallAccepted();
      }
    };

    const handleCallDeclined = ({ roomID: declinedRoomID }) => {
      if (declinedRoomID === roomID) {
        setCallStatus('declined');
        onCallDeclined && onCallDeclined();
      }
    };

    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-declined', handleCallDeclined);

    // Auto timeout after 30 seconds
    const timeout = setTimeout(() => {
      if (callStatus === 'calling') {
        setCallStatus('timeout');
        onCancel && onCancel();
      }
    }, 30000);

    return () => {
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-declined', handleCallDeclined);
      clearTimeout(timeout);
    };
  }, [roomID, callStatus, onCallAccepted, onCallDeclined, onCancel]);

  const handleCancelCall = () => {
    setCallStatus('cancelled');
    socket.emit('call-cancelled', { roomID });
    onCancel && onCancel();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        minWidth: '300px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <img
            src={calleeInfo?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(calleeInfo?.name || 'User')}&background=6366f1&color=fff`}
            alt={calleeInfo?.name || 'User'}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '0 auto 16px',
              display: 'block'
            }}
          />
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '600' }}>
            {calleeInfo?.name || calleeInfo?.username || 'User'}
          </h3>
          
          {callStatus === 'calling' && (
            <>
              <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Calling...</p>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '16px auto'
              }} />
            </>
          )}
          
          {callStatus === 'accepted' && (
            <p style={{ margin: '0', color: '#10b981', fontSize: '14px' }}>Call accepted! Connecting...</p>
          )}
          
          {callStatus === 'declined' && (
            <p style={{ margin: '0', color: '#ef4444', fontSize: '14px' }}>Call declined</p>
          )}
          
          {callStatus === 'timeout' && (
            <p style={{ margin: '0', color: '#f59e0b', fontSize: '14px' }}>No answer</p>
          )}
          
          {callStatus === 'cancelled' && (
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Call cancelled</p>
          )}
        </div>

        {callStatus === 'calling' && (
          <button
            onClick={handleCancelCall}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </button>
        )}

        {(callStatus === 'declined' || callStatus === 'timeout' || callStatus === 'cancelled') && (
          <button
            onClick={() => onCancel && onCancel()}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CallingScreen;