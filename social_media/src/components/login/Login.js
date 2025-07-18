import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

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
      <span className="font-semibold text-lg">Login Successful!</span>
    </div>
  </div>
);

const ErrorPopup = ({ show, message }) => (
  <div
    className={`fixed top-6 left-0 w-full flex justify-center z-50 transition-all duration-500 ${
      show
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-90 -translate-y-8 pointer-events-none'
    }`}
    style={{ pointerEvents: show ? 'auto' : 'none' }}
  >
    <div className="flex items-center gap-3 px-6 py-3 border-2 border-red-500 text-black rounded-xl shadow-lg bg-white">
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="font-semibold text-lg">{message}</span>
    </div>
  </div>
);

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('user');

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [navigate, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          id
          name
          email
          token
        }
      }
    `;

    const variables = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/graphql',
        { query, variables },
        {
          headers: {
            'Content-Type': 'application/json',
          },
           withCredentials: true,
        }
      );

      const { data, errors } = response.data;

      if (errors && errors.length > 0) {
        setErrorMessage('Incorrect credential, please check.');
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        setTimeout(() => navigate('/'), 2000);
        try {
          sessionStorage.setItem('user', JSON.stringify(data.login));
        } catch (error) {
          console.error("Error saving user data to sessionStorage:", error);
        }
      }

    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage('Incorrect email or password, please check.');
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SuccessPopup show={showSuccess} />
      <ErrorPopup show={showError} message={errorMessage} />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            placeholder="Enter your password"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={0}
            role="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
        <p className="text-sm text-right text-gray-600 mt-2 mb-4">
  <button
    type="button"
    onClick={() => navigate('/change')}
    className="text-blue-500 hover:underline cursor-pointer"
  >
    Forgot Password?
  </button>
</p>


        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

       <p className="text-sm text-center text-gray-600 mt-4">
  Don't have an account?{' '}
  <a
    className="text-blue-500 hover:underline cursor-pointer"
    onClick={() => navigate('/register')}
  >
    create account
  </a>
</p>


      </form>
    </div>
  );
};

export default Login;
