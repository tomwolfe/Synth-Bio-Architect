'use client';

import { useState } from 'react';

export default function Sidebar({ apiKey, setApiKey }) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
  };

  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-6 text-center">Bio-Research Co-Pilot</h2>
      
      <div className="mb-6">
        <label htmlFor="api-key" className="block text-sm font-medium mb-2">
          Gemini API Key
        </label>
        <textarea
          id="api-key"
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          className="w-full p-2 text-sm rounded bg-gray-700 border border-gray-600 text-white"
          rows="3"
          placeholder="Enter your Gemini API key"
        />
        <button
          onClick={handleSaveApiKey}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
        >
          Save Key
        </button>
      </div>
      
      <div className="mt-auto text-xs text-gray-400">
        <p>Your API key is stored locally in your browser and never sent to our servers.</p>
      </div>
    </div>
  );
}