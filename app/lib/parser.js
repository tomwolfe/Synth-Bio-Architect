import { validateBiologicalSequence } from './validation';

// Helper function to parse the response into sections
export const parseResponseIntoSections = (text) => {
  // Case-insensitive regex with flexible whitespace handling
  // Supports Phase 1, Phase I, Phase One, PHASE 1, etc.
  const phase1Regex = /(?:\d+\.\s*)?PHASE\s*(?:1|I|ONE)\s*[:\-]?\s*(?:HYPOTHESES|HYPOTHESIS)/i;
  const phase2Regex = /(?:\d+\.\s*)?PHASE\s*(?:2|II|TWO)\s*[:\-]?\s*(?:EXPERIMENTAL DESIGN|EXPERIMENT)/i;
  const phase3Regex = /(?:\d+\.\s*)?PHASE\s*(?:3|III|THREE)\s*[:\-]?\s*(?:GRANT PROPOSAL|PROPOSAL)/i;

  const hypothesesMatch = text.match(new RegExp(`${phase1Regex.source}([\\s\\S]*?)(?=${phase2Regex.source}|${phase3Regex.source}|$)`, 'i'));
  const experimentalDesignMatch = text.match(new RegExp(`${phase2Regex.source}([\\s\\S]*?)(?=${phase1Regex.source}|${phase3Regex.source}|$)`, 'i'));
  const grantProposalMatch = text.match(new RegExp(`${phase3Regex.source}([\\s\\S]*)`, 'i'));

  let hypotheses = hypothesesMatch ? hypothesesMatch[1].trim() : 'Section pending...';
  let experimentalDesign = experimentalDesignMatch ? experimentalDesignMatch[1].trim() : 'Section pending...';
  let grantProposal = grantProposalMatch ? grantProposalMatch[1].trim() : 'Section pending...';

  // Extract DNA sequences from experimental design and validate them
  experimentalDesign = validateAndFlagSequences(experimentalDesign);

  return {
    hypotheses: hypotheses,
    experimentalDesign: experimentalDesign,
    grantProposal: grantProposal
  };
};

/**
 * Finds and validates DNA sequences in text content
 * @param {string} content - Text content that may contain DNA sequences
 * @returns {string} - Updated content with validation flags
 */
function validateAndFlagSequences(content) {
  if (!content) return content;

  // Regular expression to match DNA sequences (consecutive ACGT characters)
  // At least 10 characters to be considered a meaningful sequence
  const dnaSequenceRegex = /\b[AaCcGgTt]{10,}\b/g;

  return content.replace(dnaSequenceRegex, (match) => {
    const validation = validateBiologicalSequence(match);

    if (!validation.isValid) {
      // Add warning about sequence validity
      const issuesList = validation.issues.map(issue => `- ${issue}`).join('\n');
      return `<div class="dna-validation-warning">\n**WARNING: Biologically Invalid DNA Sequence Found**\n\n${issuesList}\n\nOriginal sequence: ${match}\n</div>`;
    }

    return match; // Return the sequence as-is if valid
  });
}