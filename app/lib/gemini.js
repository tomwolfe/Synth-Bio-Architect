import { GoogleGenAI } from '@google/genai';

/**
 * Encapsulates the GoogleGenAI initialization and streaming call.
 * Uses the gemini-3-flash-preview model.
 *
 * @param {string} apiKey - The user's Google Gemini API key.
 * @param {string} prompt - The research prompt to send to the model.
 * @param {string} context - Optional context from previous generation for refinement.
 * @param {number} maxRetries - Maximum number of retry attempts for 503 errors.
 * @param {number} baseDelay - Base delay in milliseconds for exponential backoff.
 * @returns {Promise<AsyncGenerator>} - A stream of content chunks.
 */
export async function generateResearchStream(apiKey, prompt, context = null, maxRetries = 3, baseDelay = 1000) {
  const client = new GoogleGenAI({ apiKey });

  // System instruction
  const systemInstruction = "You are a world-class computational biologist. Generate 3 distinct, grounded hypotheses. For the best one, design a detailed CRISPR/peptide experiment including a Bill of Materials and a grant proposal draft.";

  // Construct the prompt
  let fullPrompt = `${systemInstruction}\n\nResearch Challenge: ${prompt}\n\nProvide your response in three sections:\n\n1. PHASE 1: HYPOTHESES - Generate 3 novel research directions.\n2. PHASE 2: EXPERIMENTAL DESIGN - Detail the protocol and list required reagents.\n3. PHASE 3: GRANT PROPOSAL - Create an NIH-style proposal with a Predicted Impact Score (0-100).\n`;

  // Add context if provided for refinement
  if (context) {
    fullPrompt += `\n\nPrevious Output:\n${context}\n\nPlease refine or modify the above content based on the new instructions.`;
  }

  // Prepare the content for the model
  const contents = [{
    role: 'user',
    parts: [{ text: fullPrompt }]
  }];

  // Retry logic with exponential backoff for 503 errors
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
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
    } catch (error) {
      lastError = error;

      // Check if it's a 503 error (model overloaded)
      const errorMessage = error.message || String(error);
      if (attempt < maxRetries && (errorMessage.includes("503") || errorMessage.includes("overloaded") || errorMessage.includes("UNAVAILABLE"))) {
        // Calculate delay with exponential backoff and jitter
        const delay = Math.pow(2, attempt) * baseDelay + Math.random() * 1000;

        console.warn(`Model overloaded (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // If it's not a 503 error or we've exhausted retries, rethrow the error
        throw error;
      }
    }
  }

  // This should not be reached, but just in case
  throw lastError;
}
