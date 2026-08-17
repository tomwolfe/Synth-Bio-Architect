'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const IMPACT_SCORE_RE = /(?:Predicted\s+)?Impact\s+Score\s*[:\(]\s*(\d{1,3})\s*(?:\/\s*100)?\s*\)?/i;

function extractImpactScore(text) {
  if (!text) return null;
  const m = text.match(IMPACT_SCORE_RE);
  if (!m) return null;
  const score = Number(m[1]);
  if (score < 0 || score > 100) return null;
  return score;
}

function ImpactBadge({ score }) {
  if (score === null) return null;
  const color =
    score >= 80 ? 'text-green-400 bg-green-900/40 border-green-700' :
    score >= 50 ? 'text-yellow-400 bg-yellow-900/40 border-yellow-700' :
                  'text-red-400 bg-red-900/40 border-red-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
      Impact Score: {score}/100
    </span>
  );
}

export default function OutputSection({ title, content, isLoading }) {
  const [copied, setCopied] = useState(false);

  const impactScore = useMemo(() => extractImpactScore(content), [content]);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isContentValid = content && content !== 'Section pending...' && content !== 'Submit a research prompt to generate content';

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-blue-400">{title}</h2>
          {title.includes('Grant Proposal') && <ImpactBadge score={impactScore} />}
        </div>
        {!isLoading && isContentValid && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
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
