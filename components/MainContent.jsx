'use client';

import { useState, useRef, useCallback } from 'react';
import OutputSection from './OutputSection';
import { parseResponseIntoSections } from '../app/lib/parser';
import { createResearchStream } from '../app/lib/gemini';

const API_KEY_REGEX = /^AIza[0-9A-Za-z_\-]{20,}$/;

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
  const abortRef = useRef(null);

  const keyFormatValid = typeof apiKey === 'string' && API_KEY_REGEX.test(apiKey.trim());
  const keyPresent = typeof apiKey === 'string' && apiKey.trim().length > 0;

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }
  }, []);

  const handleDownloadMarkdown = useCallback(() => {
    const parts = [
      '# Phase 1: Hypotheses\n\n' + (output.hypotheses || ''),
      '# Phase 2: Experimental Design\n\n' + (output.experimentalDesign || ''),
      '# Phase 3: Grant Proposal\n\n' + (output.grantProposal || ''),
    ];
    const blob = new Blob([parts.join('\n\n---\n\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-plan.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (prompt.trim().length < 20) {
      setError('Research prompt must be at least 20 characters long.');
      return;
    }

    if (!keyPresent) {
      setError('Please enter your Gemini API key in the sidebar.');
      return;
    }

    if (!keyFormatValid) {
      setError('API key format looks unusual. Proceeding anyway — if requests fail, check your key.');
    }

    setIsLoading(true);
    setIsGenerating(false);

    try {
      const trimmedApiKey = apiKey.trim();
      setOutput({ hypotheses: '', experimentalDesign: '', grantProposal: '' });

      const { stream, abort } = createResearchStream(trimmedApiKey, prompt);
      abortRef.current = abort;
      setIsGenerating(true);

      let fullText = '';
      for await (const chunk of await stream) {
        const chunkText = chunk?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (chunkText.trim()) {
          fullText += chunkText;
          setOutput(parseResponseIntoSections(fullText));
        }
      }
    } catch (err) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        // User stopped — keep whatever was parsed so far
        return;
      }
      console.error("Error calling Gemini API:", err);
      const msg = err?.message || String(err);

      if (msg.includes("403")) {
        setError('Quota Exceeded: Your API key has reached its limit or lacks permission for this model.');
      } else if (msg.includes("401") || msg.includes("400")) {
        setError('Invalid API Key: Please check your Google API key in the sidebar.');
      } else if (msg.includes("safety")) {
        setError('Safety Filter: The model refused to generate a response due to safety concerns.');
      } else if (msg.includes("An API Key must be set")) {
        setError('An API Key must be set when running in the browser. Please check your key.');
      } else {
        setError(`Error: ${msg}`);
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Synth Bio Architect</h1>
          <p className="text-gray-400 mt-2">Generate hypotheses, design experiments, and draft proposals with AI assistance</p>
        </header>

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

          {!keyPresent && (
            <p className="text-yellow-500 text-sm mb-4">⚠️ Please enter and save your API key in the sidebar first.</p>
          )}

          {keyPresent && !keyFormatValid && (
            <p className="text-yellow-500 text-sm mb-4">⚠️ API key doesn&#39;t match the expected Google format (^AIza...). It may still work.</p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isLoading || !keyPresent}
              className={`py-3 px-6 rounded-lg font-medium ${isLoading || !keyPresent
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Generating Response...' : 'Generate Research Plan'}
            </button>

            {isGenerating && (
              <button
                type="button"
                onClick={handleStop}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Stop
              </button>
            )}

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

        {output.hypotheses && output.hypotheses !== 'Section pending...' && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownloadMarkdown}
              className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm transition-colors"
            >
              Download Markdown
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-400 space-y-1">
          <p><strong className="text-gray-300">⚠️ AI-Generated Content:</strong> All hypotheses, protocols, and reagents are AI-generated. Verify with domain experts before use.</p>
          <p><strong className="text-gray-300">Biosecurity Notice:</strong> Synthetic biology research may have dual-use implications. Ensure compliance with institutional biosafety committee (IBC) protocols and applicable regulations.</p>
        </div>
      </div>
    </div>
  );
}
