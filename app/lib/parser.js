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

  return {
    hypotheses: hypothesesMatch ? hypothesesMatch[1].trim() : 'Section pending...',
    experimentalDesign: experimentalDesignMatch ? experimentalDesignMatch[1].trim() : 'Section pending...',
    grantProposal: grantProposalMatch ? grantProposalMatch[1].trim() : 'Section pending...'
  };
};

/**
 * Extracts potential PubMed IDs (PMIDs) from a string.
 * Looks for patterns like "PMID: 12345678" or "[PMID 12345678]".
 * @param {string} text - The text to search.
 * @returns {string[]} - An array of unique PMIDs found.
 */
export const extractPMIDs = (text) => {
  if (!text) return [];
  const pmidRegex = /(?:PMID[:\s]*|pubmed\/|pubmed\.ncbi\.nlm\.nih\.gov\/)(\d{7,10})/gi;
  const matches = [...text.matchAll(pmidRegex)];
  const pmids = matches.map(match => match[1]);
  return [...new Set(pmids)]; // Return unique PMIDs
};