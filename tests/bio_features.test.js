import { describe, it, expect } from 'vitest';
import { extractPMIDs } from '../app/lib/parser';

describe('extractPMIDs', () => {
  it('should extract PMIDs with "PMID:" prefix', () => {
    const text = 'Check out PMID: 12345678 and PMID: 87654321';
    const result = extractPMIDs(text);
    expect(result).toEqual(['12345678', '87654321']);
  });

  it('should extract PMIDs from pubmed URLs', () => {
    const text = 'Source: https://pubmed.ncbi.nlm.nih.gov/33445566/';
    const result = extractPMIDs(text);
    expect(result).toEqual(['33445566']);
  });

  it('should handle unique PMIDs', () => {
    const text = 'PMID: 11223344 and again PMID: 11223344';
    const result = extractPMIDs(text);
    expect(result).toEqual(['11223344']);
  });

  it('should return empty array if no PMIDs found', () => {
    const text = 'No references here.';
    const result = extractPMIDs(text);
    expect(result).toEqual([]);
  });
});
