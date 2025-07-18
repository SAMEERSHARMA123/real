import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setRegisterFormData, resetRegisterForm } from '../../redux/registerSlice';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = sessionStorage.getItem('user');
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users away from register page
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [navigate, token]);

  // Reset form data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetRegisterForm());
    };
  }, [dispatch]);

  const validatePassword = (password) => {
    if (password.length === 0) {
        setPasswordError('');
        return;
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      setPasswordError('Password cannot contain special characters.');
    } else if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number.');
    } else if (!/[a-zA-Z]/.test(password)) {
      setPasswordError('Password must contain at least one letter.');
    } else {
      setPasswordError('');
    }
  };

  const validateUsername = (username) => {
    if (username.length === 0) {
      setUsernameError('');
      return;
    }
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
    } else if (username.length > 20) {
      setUsernameError('Username must be less than 20 characters.');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores.');
    } else {
      setUsernameError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      validatePassword(value);
    } else if (name === 'username') {
      validateUsername(value);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call requestOtp mutation
      const query = `
        mutation RequestOtp($name: String!, $username: String!, $email: String!, $password: String!, $phone: String!) {
          requestOtp(name: $name, username: $username, email: $email, password: $password, phone: $phone) {
            email
            otp
            otpExpiryTime
          }
        }
      `;
      const variables = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };
      const response = await axios.post(
        'http://localhost:5000/graphql',
        { query, variables },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      
      const { data, errors } = response.data;
      if (errors && errors.length > 0) {
        alert("❌ " + errors[0].message);
        return;
      }
      
      // Store form data + otp in redux
      const backendData = data.requestOtp;
      console.log('Backend OTP response:', backendData);
      
      const reduxData = { ...formData, otp: backendData.otp, otpExpiryTime: backendData.otpExpiryTime };
      console.log('Storing in Redux:', reduxData);
      
      dispatch(setRegisterFormData(reduxData));
      
      // Also store in localStorage as backup
      try {
        localStorage.setItem('otpData', JSON.stringify(reduxData));
        console.log('Stored OTP data in localStorage');
      } catch (error) {
        console.error("Error storing OTP data in localStorage:", error);
      }
      
      // Navigate to OTP page
      navigate('/otp');
      setLoading(false);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.errors) {
        alert("❌ " + error.response.data.errors[0].message);
      } else if (error.response?.data?.message) {
        alert("❌ " + error.response.data.message);
      } else {
        alert("❌ Server Error: " + error.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
              className={`mt-1 w-full px-4 py-2 border ${usernameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${usernameError ? 'focus:ring-red-400' : 'focus:ring-blue-400'}`}
            />
            {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              minLength={6}
              className={`mt-1 w-full px-4 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${passwordError ? 'focus:ring-red-400' : 'focus:ring-blue-400'}`}
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              pattern="[0-9]{10}"
              title="10 digit phone number"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={!!passwordError || !!usernameError || loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
