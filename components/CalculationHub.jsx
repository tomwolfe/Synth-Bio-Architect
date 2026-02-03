'use client';

import { useState } from 'react';

export default function CalculationHub() {
  const [sequence, setSequence] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      // Basic FASTA parsing: take first sequence if multiple
      if (content.startsWith('>')) {
        const lines = content.split('\n');
        const seq = lines.slice(1).join('').replace(/[^ATCGU]/gi, '');
        setSequence(seq.toUpperCase());
      } else {
        setSequence(content.replace(/[^ATCGU]/gi, '').toUpperCase());
      }
    };
    reader.readAsText(file);
  };

  const handleCalculateTm = async () => {
    if (!sequence) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'melting_temp', data: { sequence } }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult({ type: 'tm', ...data });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodonOptimize = async () => {
    if (!sequence) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'codon_optimize', data: { sequence, species: 'human' } }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult({ type: 'codon', ...data });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/30 mb-10">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Calculation Hub (Deterministic)</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">DNA/Protein Sequence</label>
          <textarea
            value={sequence}
            onChange={(e) => setSequence(e.target.value.toUpperCase().replace(/[^ATCGU]/g, ''))}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700 font-mono text-sm"
            placeholder="ATCG..."
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Or upload .fasta / .fastq</label>
          <input
            type="file"
            accept=".fasta,.fastq,.fa,.fq,.txt"
            onChange={handleFileUpload}
            className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
          />
          {fileName && <span className="ml-2 text-xs text-blue-400">{fileName}</span>}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCalculateTm}
            disabled={isLoading || !sequence}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            Calculate Tm
          </button>
          <button
            onClick={handleCodonOptimize}
            disabled={isLoading || !sequence}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium disabled:opacity-50"
          >
            Codon Optimize
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {result && (
          <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
            {result.type === 'tm' ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Tm (Wallace)</p>
                  <p className="text-xl font-bold">{result.tm}°C</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">GC Content</p>
                  <p className="text-xl font-bold">{result.gc_content}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Length</p>
                  <p className="text-xl font-bold">{result.length} bp</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Optimized Sequence</p>
                <p className="font-mono text-xs break-all bg-black p-2 rounded">{result.optimized}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
