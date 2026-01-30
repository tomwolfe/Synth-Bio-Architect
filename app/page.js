'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

export default function Home() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Initialize API key from localStorage on component mount
    const savedApiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Function to update API key from child component
  const updateApiKey = (newApiKey) => {
    setApiKey(newApiKey);
  };

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar apiKey={apiKey} setApiKey={setApiKey} />
      <MainContent apiKey={apiKey} />
    </div>
  );
}