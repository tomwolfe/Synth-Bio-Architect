'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import OutputSection from './OutputSection';

export default function MainContent({ apiKey }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      // Basic validation of API key format (Google API keys typically start with "AI" followed by letters/numbers)
      const trimmedApiKey = apiKey.trim();

      // More comprehensive validation of API key format
      if (!trimmedApiKey.startsWith('AI') || trimmedApiKey.length < 30) {
        setError('Invalid API key format. Please check your Google API key.');
        setIsLoading(false);
        return;
      }

      // Ensure the API key is properly formatted for the GoogleGenAI constructor
      const genAI = new GoogleGenAI(trimmedApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
      });

      // System instruction
      const systemInstruction = "You are a world-class computational biologist. Generate 3 distinct, grounded hypotheses. For the best one, design a detailed CRISPR/peptide experiment including a Bill of Materials and a grant proposal draft.";

      // Construct the prompt
      const fullPrompt = `${systemInstruction}\n\nResearch Challenge: ${prompt}\n\nProvide your response in three sections:\n\n1. PHASE 1: HYPOTHESES - Generate 3 novel research directions with citations from Google Search.\n2. PHASE 2: EXPERIMENTAL DESIGN - Detail the protocol and list required reagents.\n3. PHASE 3: GRANT PROPOSAL - Create an NIH-style proposal with a Predicted Impact Score (0-100).`;

      // Prepare the content for the model
      const contents = [{
        role: 'user',
        parts: [{ text: fullPrompt }]
      }];

      // Initialize output sections as empty
      setOutput({
        hypotheses: '',
        experimentalDesign: '',
        grantProposal: ''
      });

      // Use streaming to get real-time responses
      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
        tools: [{
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: 'MODE_DYNAMIC',
              dynamicRetrievalThreshold: 0.7
            }
          }
        }]
      });

      // Process the streamed response
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;

        // Parse the current text into sections and update the UI in real-time
        const sections = parseResponseIntoSections(fullText);
        setOutput(sections);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Handle the specific error from the Google GenAI library
      if (error.message && error.message.includes("An API Key must be set when running in a browser")) {
        setError('Error: An API Key must be set when running in a browser. Please make sure your API key is valid and saved.');
      } else {
        setError(`Error: ${error.message || error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse the response into sections
  const parseResponseIntoSections = (text) => {
    // Case-insensitive regex with flexible whitespace handling
    const hypothesesMatch = text.match(/PHASE\s*1\s*[:\-]?\s*(?:HYPOTHESES|HYPOTHESIS)([\s\S]*?)(?=PHASE\s*\d\s*[:\-]?\s*(?:EXPERIMENTAL DESIGN|GRANT PROPOSAL)|$)/i);
    const experimentalDesignMatch = text.match(/PHASE\s*2\s*[:\-]?\s*(?:EXPERIMENTAL DESIGN|EXPERIMENT)([\s\S]*?)(?=PHASE\s*\d\s*[:\-]?\s*(?:HYPOTHESES?|GRANT PROPOSAL)|$)/i);
    const grantProposalMatch = text.match(/PHASE\s*3\s*[:\-]?\s*(?:GRANT PROPOSAL|PROPOSAL)([\s\S]*)/i);

    return {
      hypotheses: hypothesesMatch ? hypothesesMatch[1].trim() : 'Section pending...',
      experimentalDesign: experimentalDesignMatch ? experimentalDesignMatch[1].trim() : 'Section pending...',
      grantProposal: grantProposalMatch ? grantProposalMatch[1].trim() : 'Section pending...'
    };
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">AI Bio-Research Co-Pilot</h1>
          <p className="text-gray-400 mt-2">Generate hypotheses, design experiments, and draft proposals with AI assistance</p>
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

          <button
            type="submit"
            disabled={isLoading || !apiKey || apiKey.trim().length === 0 || !apiKey.trim().startsWith('AI')}
            className={`py-3 px-6 rounded-lg font-medium ${
              isLoading || !apiKey || apiKey.trim().length === 0 || !apiKey.trim().startsWith('AI')
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Generating Response...' : 'Generate Research Plan'}
          </button>
        </form>

        <div className="mt-10 space-y-10">
          <OutputSection
            title="Phase 1: Hypotheses"
            content={output.hypotheses}
            isLoading={isLoading}
          />
          <OutputSection
            title="Phase 2: Experimental Design"
            content={output.experimentalDesign}
            isLoading={isLoading}
          />
          <OutputSection
            title="Phase 3: Grant Proposal"
            content={output.grantProposal}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}