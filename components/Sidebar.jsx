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

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setTempApiKey('');
    alert('API Key cleared!');
  };

  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col h-screen border-r border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-center">Synth Bio Architect</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Gemini API Key</label>
        <input
          type="password" // Use password type for security
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          className="w-full p-2 text-sm rounded bg-gray-700 border border-gray-600 text-white"
          placeholder="AIza..."
        />
        <div className="flex gap-2">
          <button
            onClick={handleSaveApiKey}
            className="mt-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Save Key
          </button>
          <button
            onClick={handleClearApiKey}
            className="mt-2 flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Clear Key
          </button>
        </div>
      </div>
    </div>
  );
}