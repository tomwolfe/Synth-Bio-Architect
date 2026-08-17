/**
 * Parse a streamed LLM response into three labelled sections.
 *
 * Handles:
 *   - Markdown headers (##, ###) and bold (**PHASE 2**)
 *   - Leading list markers (1., -, *)
 *   - Case-insensitive phase labels (PHASE 1 / Phase I / Phase One / etc.)
 *   - Missing sections → "Section pending..."
 *   - Strips the matched phase header line from captured content.
 *
 * @param {string} text
 * @returns {{ hypotheses: string, experimentalDesign: string, grantProposal: string }}
 */
export const parseResponseIntoSections = (text) => {
  if (!text || typeof text !== 'string') {
    return { hypotheses: 'Section pending...', experimentalDesign: 'Section pending...', grantProposal: 'Section pending...' };
  }

  const stripHeader = (s) => s.replace(/^\s*#*\s*\*{0,2}/, '').trimStart();

  // Build phase header patterns — flexible with markdown bold, hashes, list markers
  const markers = '(?:\\d+\\.\\s*|[-*]\\s+)?';
  const mdPrefix = '(?:#{1,6}\\s+)*(?:\\*{1,2}\\s*)?';
  const mdSuffix = '\\*{0,2}';

  const p1 = new RegExp(
    `${markers}${mdPrefix}PHASE\\s*(?:1|I|ONE)\\s*[:\\-]?\\s*(?:HYPOTHESES|HYPOTHESIS)${mdSuffix}`, 'i'
  );
  const p2 = new RegExp(
    `${markers}${mdPrefix}PHASE\\s*(?:2|II|TWO)\\s*[:\\-]?\\s*(?:EXPERIMENTAL\\s*DESIGN|EXPERIMENT)${mdSuffix}`, 'i'
  );
  const p3 = new RegExp(
    `${markers}${mdPrefix}PHASE\\s*(?:3|III|THREE)\\s*[:\\-]?\\s*(?:GRANT\\s*PROPOSAL|PROPOSAL)${mdSuffix}`, 'i'
  );

  const next = (except) => [p1, p2, p3].filter((r) => r.source !== except.source).map((r) => r.source).join('|');

  const h1 = text.match(new RegExp(`${p1.source}([\\s\\S]*?)(?=${next(p1)}|$)`, 'i'));
  const h2 = text.match(new RegExp(`${p2.source}([\\s\\S]*?)(?=${next(p2)}|$)`, 'i'));
  const h3 = text.match(new RegExp(`${p3.source}([\\s\\S]*)`, 'i'));

  const clean = (raw) => {
    if (!raw) return 'Section pending...';
    // Strip the header line itself if captured in group 1
    let content = raw.trim();
    // Remove the first line if it looks like a repeated header fragment
    const firstLineEnd = content.indexOf('\n');
    const firstLine = firstLineEnd === -1 ? content : content.slice(0, firstLineEnd);
    if (firstLine && (p1.test(firstLine) || p2.test(firstLine) || p3.test(firstLine))) {
      content = content.slice(firstLineEnd + 1).trimStart();
    }
    return content || 'Section pending...';
  };

  return {
    hypotheses: clean(h1?.[1]),
    experimentalDesign: clean(h2?.[1]),
    grantProposal: clean(h3?.[1]),
  };
};
