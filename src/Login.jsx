// src/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { redirect } from 'react-router-dom';  

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      //const response = await axios.post('http://192.168.18.36:5050/api/v1/admin/login', {
        const response = await axios.post('https://campus-check-server.onrender.com/api/v1/admin/login', {
        user: username,
        password: password
      });
      console.log('Login successful:', response.data);
      setIsLoggedIn(true);
      console.log('Login successful token:', response.data.token);
      localStorage.setItem('token', response.data.token);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 border rounded text-gray-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
