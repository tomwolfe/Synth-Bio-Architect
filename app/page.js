'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

export default function Home() {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar apiKey={apiKey} setApiKey={setApiKey} />
      <MainContent apiKey={apiKey} />
    </div>
  );
}