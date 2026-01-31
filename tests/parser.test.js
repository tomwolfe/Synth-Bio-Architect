import { describe, it, expect } from 'vitest';
import { parseResponseIntoSections } from '../app/lib/parser';

describe('parseResponseIntoSections', () => {
  it('should parse perfectly formatted response', () => {
    const text = `1. PHASE 1: HYPOTHESES
This is the hypotheses section content.

2. PHASE 2: EXPERIMENTAL DESIGN
This is the experimental design section content.

3. PHASE 3: GRANT PROPOSAL
This is the grant proposal section content.`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('This is the hypotheses section content.');
    expect(result.experimentalDesign).toBe('This is the experimental design section content.');
    expect(result.grantProposal).toBe('This is the grant proposal section content.');
  });

  it('should be case-insensitive', () => {
    const text = `1. phase 1: hypotheses
Content 1
2. phase 2: experimental design
Content 2
3. phase 3: grant proposal
Content 3`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Content 1');
    expect(result.experimentalDesign).toBe('Content 2');
    expect(result.grantProposal).toBe('Content 3');
  });

  it('should handle extra newlines and whitespace', () => {
    const text = `PHASE 1 : HYPOTHESIS   


   Content with whitespace   


PHASE 2 - EXPERIMENT

Content 2

PHASE 3: PROPOSAL

Content 3`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Content with whitespace');
    expect(result.experimentalDesign).toBe('Content 2');
    expect(result.grantProposal).toBe('Content 3');
  });

  it('should handle Roman numerals', () => {
    const text = `PHASE I: HYPOTHESES
Content I
PHASE II: EXPERIMENTAL DESIGN
Content II
PHASE III: GRANT PROPOSAL
Content III`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Content I');
    expect(result.experimentalDesign).toBe('Content II');
    expect(result.grantProposal).toBe('Content III');
  });

  it('should handle word-based numbers', () => {
    const text = `PHASE ONE: HYPOTHESES
Content One
PHASE TWO: EXPERIMENTAL DESIGN
Content Two
PHASE THREE: GRANT PROPOSAL
Content Three`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Content One');
    expect(result.experimentalDesign).toBe('Content Two');
    expect(result.grantProposal).toBe('Content Three');
  });

  it('should return "Section pending..." for missing sections', () => {
    const text = `Some random text without proper sections`;
    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Section pending...');
    expect(result.experimentalDesign).toBe('Section pending...');
    expect(result.grantProposal).toBe('Section pending...');
  });

  it('should handle sections out of order', () => {
    const text = `PHASE 2: EXPERIMENTAL DESIGN
Content 2
PHASE 1: HYPOTHESES
Content 1
PHASE 3: GRANT PROPOSAL
Content 3`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Content 1');
    expect(result.experimentalDesign).toBe('Content 2');
    expect(result.grantProposal).toBe('Content 3');
  });
});
