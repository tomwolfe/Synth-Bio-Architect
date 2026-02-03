'use client';

import { useState } from 'react';
import OutputSection from './OutputSection';
import SecurityBadge from './SecurityBadge';
import { parseResponseIntoSections } from '../app/lib/parser';
import { generateResearchStream } from '../app/lib/gemini';

export default function MainContent({ apiKey }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState({
    hypotheses: '',
    experimentalDesign: '',
    grantProposal: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Validate prompt length
    if (prompt.trim().length < 20) {
      setError('Research prompt must be at least 20 characters long.');
      return;
    }

    // Check if API key exists and is valid (basic validation)
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      setError('Please enter your Gemini API key');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsGenerating(false);

    try {
      const trimmedApiKey = apiKey.trim();

      // Basic validation of API key format
      if (!trimmedApiKey.startsWith('AI') || trimmedApiKey.length < 30) {
        setError('Invalid API key format. Please check your Google API key.');
        setIsLoading(false);
        return;
      }

      // Initialize output sections as empty
      setOutput({
        hypotheses: '',
        experimentalDesign: '',
        grantProposal: ''
      });

      const result = await generateResearchStream(trimmedApiKey, prompt);
      setIsGenerating(true);

      // Process the streamed response
      let fullText = '';
      for await (const chunk of result) {
        // Access text via the candidates array
        const chunkText = chunk.candidates[0].content.parts[0].text || '';

        if (chunkText.trim()) {
          fullText += chunkText;
          // Parse the current text into sections and update the UI in real-time
          const sections = parseResponseIntoSections(fullText);
          setOutput(sections);
        }
      }
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      const errorMessage = err.message || String(err);

      if (errorMessage.includes("403")) {
        setError('Quota Exceeded: Your API key has reached its limit or doesn\'t have permission for this model.');
      } else if (errorMessage.includes("401") || errorMessage.includes("400")) {
        setError('Invalid API Key: Please check your Google API key in the sidebar.');
      } else if (errorMessage.includes("safety")) {
        setError('Safety Filter: The model refused to generate a response due to safety concerns.');
      } else if (errorMessage.includes("An API Key must be set")) {
        setError('Error: An API Key must be set when running in a browser. Please make sure your API key is valid and saved.');
      } else {
        setError(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Synth Bio Architect</h1>
              <p className="text-gray-400 mt-2">Generate hypotheses, design experiments, and draft proposals with AI assistance</p>
            </div>
            <SecurityBadge />
          </div>
        </header>

        {/* Error message display */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="research-prompt" className="block text-sm font-medium mb-2">
              Research Prompt
            </label>
            <textarea
              id="research-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white min-h-[150px]"
              placeholder="Describe your research challenge (e.g., 'Find me a way to cure ALS using CRISPR and AI-designed peptides')"
            />
          </div>

          {!apiKey && (
            <p className="text-yellow-500 text-sm mb-4">⚠️ Please enter and save your API key in the sidebar first.</p>
          )}

          {apiKey && apiKey.trim().length > 0 && !apiKey.trim().startsWith('AI') && (
            <p className="text-yellow-500 text-sm mb-4">⚠️ Invalid API key format. Google API keys should start with "AI".</p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading || !apiKey || apiKey.trim().length === 0 || !apiKey.trim().startsWith('AI')}
              className={`py-3 px-6 rounded-lg font-medium ${ isLoading || !apiKey || apiKey.trim().length === 0 || !apiKey.trim().startsWith('AI')
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Generating Response...' : 'Generate Research Plan'}
            </button>

            {isGenerating && (
              <span className="text-blue-400 animate-pulse flex items-center">
                <span className="mr-2 h-2 w-2 bg-blue-400 rounded-full"></span>
                Generating...
              </span>
            )}
          </div>
        </form>

        <div className="mt-10 space-y-10">
          <OutputSection
            title="Phase 1: Hypotheses"
            content={output.hypotheses}
            isLoading={isLoading && !isGenerating}
          />
          <OutputSection
            title="Phase 2: Experimental Design"
            content={output.experimentalDesign}
            isLoading={isLoading && !isGenerating}
          />
          <OutputSection
            title="Phase 3: Grant Proposal"
            content={output.grantProposal}
            isLoading={isLoading && !isGenerating}
          />
        </div>
      </div>
    </div>
  );
}

