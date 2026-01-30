'use client';

import { useState, useEffect } from 'react';

export default function Sidebar({ apiKey, setApiKey }) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // CRITICAL: Update the local input field when the parent state (from localStorage) loads
  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setApiKey(trimmed);
    localStorage.setItem('gemini_api_key', trimmed);
    alert('API Key saved!');
  };

  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col h-screen border-r border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-center">Bio-Research Co-Pilot</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Gemini API Key</label>
        <input
          type="password" // Use password type for security
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          className="w-full p-2 text-sm rounded bg-gray-700 border border-gray-600 text-white"
          placeholder="AIza..."
        />
        <button
          onClick={handleSaveApiKey}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
        >
          Save Key
        </button>
      </div>
    </div>
  );
}