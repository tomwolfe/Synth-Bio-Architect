'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { extractPMIDs } from '../app/lib/parser';

export default function OutputSection({ title, content, isLoading }) {
  const [copied, setCopied] = useState(false);
  const [verifiedPMIDs, setVerifiedPMIDs] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (content && !isLoading) {
      const pmids = extractPMIDs(content);
      if (pmids.length > 0) {
        verify(pmids);
      }
    }
  }, [content, isLoading]);

  const verify = async (pmids) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-pmids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pmids }),
      });
      const data = await response.json();
      setVerifiedPMIDs(data.results || []);
    } catch (err) {
      console.error('Failed to verify PMIDs', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportBenchling = () => {
    // Simple JSON transform of the content (mocking Bill of Materials extraction)
    const exportData = {
      title,
      exportedAt: new Date().toISOString(),
      content: content,
      schema: "Benchling-LIMS-v1"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experimental_design_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isContentValid = content && content !== 'Section pending...' && content !== 'Submit a research prompt to generate content';
  const isExperimentalDesign = title.includes('Phase 2');

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-400">{title}</h2>
        <div className="flex gap-2">
          {!isLoading && isContentValid && isExperimentalDesign && (
            <button
              onClick={handleExportBenchling}
              className="px-3 py-1 text-xs bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
            >
              Export to Benchling
            </button>
          )}
          {!isLoading && isContentValid && (
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {verifiedPMIDs.length > 0 && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-xs">
          <p className="font-semibold mb-2 flex items-center">
            <span className="mr-2">📚 Literature Verification</span>
            {isVerifying && <span className="animate-pulse">...</span>}
          </p>
          <ul className="space-y-1">
            {verifiedPMIDs.map((res, i) => (
              <li key={i} className={res.valid ? "text-green-400" : "text-red-400"}>
                {res.valid ? `✅ PMID ${res.pmid}: ${res.title.substring(0, 60)}...` : `❌ PMID ${res.pmid}: Invalid or Not Found`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="prose prose-invert max-w-none">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        ) : content ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-400 italic">Submit a research prompt to generate content</p>
        )}
      </div>
    </div>
  );
}