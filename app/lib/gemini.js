import { GoogleGenAI } from '@google/genai';

/**
 * Encapsulates the GoogleGenAI initialization and streaming call.
 * Uses the gemini-3-flash-preview model.
 * 
 * @param {string} apiKey - The user's Google Gemini API key.
 * @param {string} prompt - The research prompt to send to the model.
 * @returns {Promise<AsyncGenerator>} - A stream of content chunks.
 */
export async function generateResearchStream(apiKey, prompt) {
  const client = new GoogleGenAI({ apiKey });

  // System instruction
  const systemInstruction = "You are a world-class computational biologist. Generate 3 distinct, grounded hypotheses. For each hypothesis, provide actual PubMed IDs (PMIDs) to support your claims where possible (format as PMID: 12345678). For the best one, design a detailed CRISPR/peptide experiment including a Bill of Materials and a grant proposal draft.";

  // Construct the prompt
  const fullPrompt = `${systemInstruction}\n\nResearch Challenge: ${prompt}\n\nProvide your response in three sections:\n\n1. PHASE 1: HYPOTHESES - Generate 3 novel research directions.\n2. PHASE 2: EXPERIMENTAL DESIGN - Detail the protocol and list required reagents.\n3. PHASE 3: GRANT PROPOSAL - Create an NIH-style proposal with a Predicted Impact Score (0-100).
`;

  // Prepare the content for the model
  const contents = [{
    role: 'user',
    parts: [{ text: fullPrompt }]
  }];

  // Use streaming to get real-time responses
  return await client.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}
