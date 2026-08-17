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

  // --- New markdown-focused tests ---

  it('should handle markdown headers around phase labels', () => {
    const text = `## PHASE 1: HYPOTHESES
Hypothesis content here

## PHASE 2: EXPERIMENTAL DESIGN
Design content here

## PHASE 3: GRANT PROPOSAL
Proposal content here`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Hypothesis content here');
    expect(result.experimentalDesign).toBe('Design content here');
    expect(result.grantProposal).toBe('Proposal content here');
  });

  it('should handle bold markdown around phase labels', () => {
    const text = `**PHASE 1: HYPOTHESES**
Bold hypothesis content

**PHASE 2 - EXPERIMENTAL DESIGN**
Bold design content

**PHASE 3: GRANT PROPOSAL**
Bold proposal content`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Bold hypothesis content');
    expect(result.experimentalDesign).toBe('Bold design content');
    expect(result.grantProposal).toBe('Bold proposal content');
  });

  it('should handle markdown hash + bold combined', () => {
    const text = `## **PHASE 1: HYPOTHESES**
Hash-bold hypothesis

### **PHASE 2: EXPERIMENTAL DESIGN**
Hash-bold design

#### **PHASE 3: GRANT PROPOSAL**
Hash-bold proposal`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Hash-bold hypothesis');
    expect(result.experimentalDesign).toBe('Hash-bold design');
    expect(result.grantProposal).toBe('Hash-bold proposal');
  });

  it('should handle leading list markers before phase headers', () => {
    const text = `- PHASE 1: HYPOTHESES
Hypothesis A

- PHASE 2: EXPERIMENTAL DESIGN
Design A

- PHASE 3: GRANT PROPOSAL
Proposal A`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Hypothesis A');
    expect(result.experimentalDesign).toBe('Design A');
    expect(result.grantProposal).toBe('Proposal A');
  });

  it('should handle numbered list markers before phase headers', () => {
    const text = `1. PHASE 1: HYPOTHESES
Hypothesis with number

1. PHASE 2: EXPERIMENTAL DESIGN
Design with number

1. PHASE 3: GRANT PROPOSAL
Proposal with number`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Hypothesis with number');
    expect(result.experimentalDesign).toBe('Design with number');
    expect(result.grantProposal).toBe('Proposal with number');
  });

  it('should handle dash list markers', () => {
    const text = `- PHASE 1 - HYPOTHESES
Dash hypothesis

- PHASE 2 - EXPERIMENT
Dash design

- PHASE 3 - PROPOSAL
Dash proposal`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses).toBe('Dash hypothesis');
    expect(result.experimentalDesign).toBe('Dash design');
    expect(result.grantProposal).toBe('Dash proposal');
  });

  it('should handle null/undefined input gracefully', () => {
    const result = parseResponseIntoSections(null);
    expect(result.hypotheses).toBe('Section pending...');
    expect(result.experimentalDesign).toBe('Section pending...');
    expect(result.grantProposal).toBe('Section pending...');
  });

  it('should handle empty string input gracefully', () => {
    const result = parseResponseIntoSections('');
    expect(result.hypotheses).toBe('Section pending...');
    expect(result.experimentalDesign).toBe('Section pending...');
    expect(result.grantProposal).toBe('Section pending...');
  });

  it('should strip the phase header from captured content', () => {
    const text = `PHASE 1: HYPOTHESES
Actual hypothesis text

PHASE 2: EXPERIMENTAL DESIGN
Actual design text

PHASE 3: GRANT PROPOSAL
Actual proposal text`;

    const result = parseResponseIntoSections(text);
    expect(result.hypotheses.startsWith('PHASE 1')).toBe(false);
    expect(result.experimentalDesign.startsWith('PHASE 2')).toBe(false);
    expect(result.grantProposal.startsWith('PHASE 3')).toBe(false);
    expect(result.hypotheses).toBe('Actual hypothesis text');
    expect(result.experimentalDesign).toBe('Actual design text');
    expect(result.grantProposal).toBe('Actual proposal text');
  });
});
