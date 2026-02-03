import {
  ResearchResponseSchema,
  HypothesisSchema,
  ExperimentalDesignSchema,
  GrantProposalSchema
} from './schemas.js';

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

export const validateHypothesesSection = (text) => {
  if (text === 'Section pending...' || text === 'Submit a research prompt to generate content') {
    throw new Error('Hypotheses section is pending. Please generate content first.');
  }

  return HypothesisSchema.safeParse(text);
};

export const validateExperimentalDesignSection = (text) => {
  if (text === 'Section pending...' || text === 'Submit a research prompt to generate content') {
    throw new Error('Experimental design section is pending. Please generate content first.');
  }

  return ExperimentalDesignSchema.safeParse(text);
};

export const validateGrantProposalSection = (text) => {
  if (text === 'Section pending...' || text === 'Submit a research prompt to generate content') {
    throw new Error('Grant proposal section is pending. Please generate content first.');
  }

  return GrantProposalSchema.safeParse(text);
};

export const validateResearchResponse = (sections) => {
  try {
    const validatedHypotheses = validateHypothesesSection(sections.hypotheses);
    const validatedExperimentalDesign = validateExperimentalDesignSection(sections.experimentalDesign);
    const validatedGrantProposal = validateGrantProposalSection(sections.grantProposal);

    return {
      hypotheses: validatedHypotheses,
      experimentalDesign: validatedExperimentalDesign,
      grantProposal: validatedGrantProposal
    };
  } catch (error) {
    throw new Error(`Research response validation failed: ${error.message}`);
  }
};