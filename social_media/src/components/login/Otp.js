import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const SuccessPopup = ({ show }) => (
  <div
    className={`fixed top-6 left-0 w-full flex justify-center z-50 transition-all duration-500 ${
      show
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
    }`}
    style={{ pointerEvents: show ? 'auto' : 'none' }}
  >
    <div className="flex items-center gap-3 px-6 py-3 border-2 border-purple-500 text-black rounded-xl shadow-lg bg-transparent">
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-semibold text-lg">OTP Verified Successfully!</span>
    </div>
  </div>
);

const OtpInput = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(120); 
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const otpData = location?.state?.form?.registerUser;
     
  const otpValue = otpData?.otp;
  const otpExpiry = otpData?.otpExpiryTime;

  const reduxFormData = useSelector((state) => state.register.formData);

  // Get OTP data from localStorage as backup
  const getOtpData = () => {
    const localStorageData = localStorage.getItem('otpData');
    if (localStorageData) {
      try {
        return JSON.parse(localStorageData);
      } catch (e) {
        console.error('Error parsing localStorage OTP data:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show redux object in console before verify
    console.log('OTP + Form Data from Redux:', reduxFormData);
    
    // Also check localStorage
    const localStorageOtp = getOtpData();
    console.log('OTP from localStorage:', localStorageOtp);
    
    // If Redux data is missing but localStorage has data, use localStorage
    if ((!reduxFormData.otp || !reduxFormData.email) && localStorageOtp) {
      console.log('Using OTP data from localStorage');
      // You can dispatch this data back to Redux if needed
    }
  }, [reduxFormData]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      try {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      } catch (error) {
        console.error("Error focusing next input:", error);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    try {
      if (e.key === 'Backspace' && index > 0 && !otp[index]) {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } catch (error) {
      console.error("Error handling key down event:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      alert("Please enter all 6 digits of the OTP");
      return;
    }

    // Get OTP data - try Redux first, then localStorage
    let otpData = reduxFormData;
    if (!otpData.otp || !otpData.email) {
      const localStorageData = getOtpData();
      if (localStorageData) {
        otpData = localStorageData;
        console.log('Using OTP data from localStorage');
      } else {
        alert("OTP data not found. Please try registering again.");
        navigate('/register');
        return;
      }
    }
    
    // Convert otpExpiryTime to timestamp if it's a string
    let expiryTime = otpData.otpExpiryTime;
    if (typeof expiryTime === 'string') {
      expiryTime = new Date(expiryTime).getTime();
    }
    
    // Fix: define currentTime
    const currentTime = Date.now();
    console.log('Current time:', currentTime);
    console.log('Expiry time:', expiryTime);
    console.log('Time left:', timeLeft);
    
    if (currentTime > expiryTime || timeLeft === 0) {
      alert("OTP has expired. Please request a new one.");
      return;
    }

    // Convert both OTPs to strings for comparison
    const enteredOtpString = enteredOtp.toString();
    const storedOtpString = otpData.otp.toString();

    console.log('Comparing:', enteredOtpString, '===', storedOtpString);

    if (enteredOtpString === storedOtpString) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      // OTP verify hone ke baad user ko backend me save karo
      try {
        const query = `
          mutation RegisterUser($email: String!, $otp: Int!) {
            registerUser(email: $email, otp: $otp) {
              id
              name
              email
              phone
              createTime
              token
            }
          }
        `;
        const variables = {
          email: otpData.email,
          otp: parseInt(enteredOtp),
        };
        const response = await axios.post(
          'http://localhost:5000/graphql', 
          { query, variables }, 
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        
        // Check for GraphQL errors
        if (response.data.errors && response.data.errors.length > 0) {
          setShowSuccess(false);
          alert('❌ ' + response.data.errors[0].message);
          return;
        }
        
        // Clear localStorage after successful registration
        localStorage.removeItem('otpData');
        
        // Success - navigate to login page
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setShowSuccess(false);
        console.error('Registration error:', err);
        
        // Handle different types of errors
        if (err.response?.data?.errors) {
          alert('❌ ' + err.response.data.errors[0].message);
        } else if (err.response?.data?.message) {
          alert('❌ ' + err.response.data.message);
        } else {
          alert('❌ Registration failed: ' + (err.message || 'Unknown error'));
        }
      }
    } else {
      console.log('OTP mismatch!');
      alert("Your OTP is not matched. Please check and try again.");
    }
  };

  const formatTime = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SuccessPopup show={showSuccess} />
      
      <form className="bg-white p-8 rounded-2xl shadow-md text-center w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-2">
          Enter the 6-digit code sent to your number
        </p>
        <p className="text-red-500 font-medium mb-4">
          OTP expires in: {formatTime()}
        </p>
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 h-12 text-xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={timeLeft === 0}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={timeLeft === 0}
          className={`w-full font-semibold py-2 rounded-lg transition ${
            timeLeft === 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default OtpInput;
