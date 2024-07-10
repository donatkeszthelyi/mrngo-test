'use client';

import './globals.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MainPage = () => {
  const router = useRouter();

  const enterPage = async () => {
    router.push(`/username-entry`);
  };

  return (
    <>
      <div className="hidden md:block w-80 h-60"></div>
      <div className="relative text-center">
        <h1 className="text-center text-5xl lg:text-7xl font-bold font-heading mb-6 max-w-2xl mx-auto">
          Welcome to the <span className="text-cyan-400">MeReNGO</span> study!
        </h1>
        <div className="hidden md:block w-80 h-10"></div>
        <button
          className="text-2xl w-full sm:w-auto text-center h-20 flex-box items-center justify-center py-4 px-6 rounded-full bg-cyan-400 border border-cyan-400 shadow font-bold font-heading text-black hover:bg-cyan-200 focus:ring focus:ring-cyan-400 transition duration-200"
          onClick={enterPage}
        >
          Enter Page
        </button>
      </div>
    </>
  );
};

export default MainPage;
