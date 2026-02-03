'use client';

import { useState } from 'react';

export default function RefineButton({
  content,
  onRefine,
  phase,
  isLoading
}) {
  const [refineText, setRefineText] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    if (!refineText.trim() || !content || content === 'Section pending...') {
      return;
    }

    setIsRefining(true);
    try {
      await onRefine(content, refineText, phase);
    } finally {
      setIsRefining(false);
      setRefineText('');
    }
  };

  const isContentValid = content && content !== 'Section pending...' && content !== 'Submit a research prompt to generate content';

  return (
    <div className="mt-4 flex gap-2">
      <input
        type="text"
        value={refineText}
        onChange={(e) => setRefineText(e.target.value)}
        placeholder={`Refine ${phase}...`}
        disabled={isRefining || !isContentValid}
        className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleRefine}
        disabled={isRefining || !isContentValid || !refineText.trim()}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isRefining ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Refining...
          </>
        ) : (
          'Refine'
        )}
      </button>
    </div>
  );
}
