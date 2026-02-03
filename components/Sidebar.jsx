'use client';

import { useState, useEffect } from 'react';

export default function Sidebar({ apiKey, setApiKey }) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState('standard');

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

  const workflowOptions = [
    { id: 'standard', name: 'Standard Research' },
    { id: 'golden_gate', name: 'Golden Gate Assembly' },
    { id: 'crispr_design', name: 'CRISPR Design' },
    { id: 'metabolic_pathway', name: 'Metabolic Pathway Design' },
    { id: 'protein_engineering', name: 'Protein Engineering' }
  ];

  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col h-screen border-r border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-center">Synth Bio Architect</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Gemini API Key</label>
        <div className="relative">
          <input
            type="password" // Use password type for security
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            className="w-full p-2 text-sm rounded bg-gray-700 border border-gray-600 text-white pr-8"
            placeholder="AIza..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSaveApiKey}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Save Key
          </button>
          <button
            onClick={handleClearApiKey}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Clear Key
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Specialized Workflows</label>
          <button
            onClick={() => setShowWorkflows(!showWorkflows)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showWorkflows ? 'Hide' : 'Show'}
          </button>
        </div>

        {showWorkflows && (
          <div className="space-y-2">
            {workflowOptions.map((workflow) => (
              <div key={workflow.id} className="flex items-center">
                <input
                  type="radio"
                  id={workflow.id}
                  name="workflow"
                  checked={selectedWorkflow === workflow.id}
                  onChange={() => setSelectedWorkflow(workflow.id)}
                  className="mr-2"
                />
                <label htmlFor={workflow.id} className="text-sm">
                  {workflow.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}