'use client';

import '../globals.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UsernameEntry = () => {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleProceed = async () => {
    if (!username) {
      alert('Please enter a username.');
      return;
    }

    // Navigate to the concept entry page with the username as a query parameter
    router.push(
      `/dashboard/concept-entry-audio?username=${encodeURIComponent(username)}`
    );
  };

  return (
    <>
      <div className="relative text-center">
        <div className="hidden md:block w-80 h-40"></div>
        <h1 className="text-center text-5xl lg:text-7xl font-bold font-heading mb-6 max-w-4xl mx-auto">
          Enter your username!
        </h1>
        <div className="hidden md:block w-80 h-20"></div>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-2xl w-full sm:w-auto text-center h-20 flex-box items-center justify-center py-4 px-6 rounded-3xl bg-white-100 border border-orange-800 shadow font-bold font-heading text-black hover:bg-white-200 focus:ring focus:ring-orange-100 transition duration-200"
        />
        <div className="hidden md:block w-80 h-5"></div>
        <button
          className="text-2xl w-full sm:w-auto text-center h-20 flex-box items-center justify-center py-4 px-6 rounded-full bg-cyan-400 border border-cyan-400 shadow font-bold font-heading text-black hover:bg-cyan-200 focus:ring focus:ring-cyan-400 transition duration-200"
          onClick={handleProceed}
        >
          Proceed
        </button>
      </div>
    </>
  );
};

export default UsernameEntry;
