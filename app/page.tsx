'use client';

import { useState } from 'react';
import './globals.css';

const HomePage = () => {
  const [username, setUsername] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleNavigate = () => {
    if (username.trim() === '') {
      alert('Please enter a username');
    } else {
      window.location.href = `/dashboard/concept-entry?username=${encodeURIComponent(
        username
      )}`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to My App</h1>
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={handleInputChange}
          placeholder="Enter Username"
          className="p-2 border border-gray-300 rounded text-black"
        />
      </div>
      <button
        onClick={handleNavigate}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Navigate to Dashboard
      </button>
    </div>
  );
};

export default HomePage;
