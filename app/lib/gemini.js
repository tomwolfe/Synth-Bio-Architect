import { GoogleGenAI } from '@google/genai';

export const GEMINI_CONFIG = {
  model: "gemini-3-flash-preview",
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

const SYSTEM_INSTRUCTION =
  "You are a world-class computational biologist. " +
  "Always state your assumptions explicitly. " +
  "Use only verifiable, standard reagents and commercially available materials. " +
  "Never fabricate citations — if you reference a paper, give enough detail to find it (author, year, journal) or omit it. " +
  "For any dual-use or pathogen-related work, include a brief safety and ethics consideration. " +
  "Be honest about uncertainty and limitations.";

/**
 * Generates a streaming research plan from Gemini.
 *
 * @param {string} apiKey - Google Gemini API key.
 * @param {string} prompt  - Research challenge text.
 * @param {AbortSignal} [signal] - Optional abort signal to cancel the stream.
 * @returns {{ stream: AsyncGenerator, abort: () => void }}
 */
export function createResearchStream(apiKey, prompt, signal) {
  const client = new GoogleGenAI({ apiKey });

  const fullPrompt =
    `Research Challenge: ${prompt}\n\n` +
    "Provide your response in three clearly labelled sections:\n\n" +
    "1. PHASE 1: HYPOTHESES - Generate 3 novel, testable research directions.\n" +
    "2. PHASE 2: EXPERIMENTAL DESIGN - Detail the protocol and list a Bill of Materials with specific reagents, concentrations, and suppliers where possible.\n" +
    "3. PHASE 3: GRANT PROPOSAL - Create an NIH-style proposal including Specific Aims, Background, Preliminary Data (if applicable), and a Predicted Impact Score (0-100).\n";

  const contents = [{ role: 'user', parts: [{ text: fullPrompt }] }];

  let abortController;
  let abortCalled = false;

  if (signal) {
    abortController = new AbortController();
    signal.addEventListener('abort', () => abortController.abort(), { once: true });
  } else {
    abortController = new AbortController();
  }

  const abort = () => {
    if (!abortCalled) {
      abortCalled = true;
      abortController.abort();
    }
  };

  const streamPromise = client.models.generateContentStream({
    model: GEMINI_CONFIG.model,
    contents,
    config: {
      temperature: GEMINI_CONFIG.temperature,
      topP: GEMINI_CONFIG.topP,
      topK: GEMINI_CONFIG.topK,
      maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
    },
    signal: abortController.signal,
  });

  return { stream: streamPromise, abort };
}
