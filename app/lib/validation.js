/**
 * Biological sequence validation utilities
 * Validates DNA sequences for basic biological constraints
 */

/**
 * Checks if a DNA sequence meets basic biological constraints
 * @param {string} sequence - DNA sequence to validate
 * @returns {Object} - Validation result with isValid flag and issues found
 */
export function validateDNASequence(sequence) {
  if (!sequence || typeof sequence !== 'string') {
    return {
      isValid: false,
      issues: ['Sequence is invalid or empty']
    };
  }

  const cleanSequence = sequence.toUpperCase().replace(/[^ACGT]/g, '');
  
  if (cleanSequence.length === 0) {
    return {
      isValid: false,
      issues: ['No valid DNA bases (A, C, G, T) found in sequence']
    };
  }

  const issues = [];
  
  // Check GC content (should be between 40-60% for most organisms)
  const gcCount = (cleanSequence.match(/[GC]/g) || []).length;
  const gcPercentage = (gcCount / cleanSequence.length) * 100;
  
  if (gcPercentage < 40 || gcPercentage > 60) {
    issues.push(`GC content is ${gcPercentage.toFixed(2)}%, outside optimal range (40-60%)`);
  }
  
  // Check for homopolymers (repeated nucleotides > 6bp)
  const homopolymerRegex = /(A{7,}|C{7,}|G{7,}|T{7,})/;
  const homopolymerMatch = cleanSequence.match(homopolymerRegex);
  if (homopolymerMatch) {
    issues.push(`Found homopolymer stretch: ${homopolymerMatch[0]} (${homopolymerMatch[0].length} bp)`);
  }
  
  // Check for palindromic sequences (potential hairpins)
  // Look for sequences that might form hairpin structures
  const palindromeIssues = checkForPalindromes(cleanSequence);
  if (palindromeIssues.length > 0) {
    issues.push(...palindromeIssues);
  }
  
  // Check for repetitive elements
  const repeatIssues = checkForRepeats(cleanSequence);
  if (repeatIssues.length > 0) {
    issues.push(...repeatIssues);
  }

  return {
    isValid: issues.length === 0,
    issues,
    gcPercentage,
    sequenceLength: cleanSequence.length
  };
}

/**
 * Checks for potential palindromic sequences that could form hairpins
 * @param {string} sequence - DNA sequence to check
 * @returns {Array} - Array of issues found
 */
function checkForPalindromes(sequence) {
  const issues = [];
  const minLength = 6; // Minimum length to consider as palindrome
  
  for (let i = 0; i <= sequence.length - minLength * 2; i++) {
    for (let len = minLength; len <= Math.min(12, sequence.length - i); len++) {
      const forward = sequence.substring(i, i + len);
      const reverseComplement = getReverseComplement(forward);
      
      // Check if this reverse complement appears later in the sequence
      // which could lead to hairpin formation
      const restOfSeq = sequence.substring(i + len);
      if (restOfSeq.includes(reverseComplement)) {
        const matchPos = restOfSeq.indexOf(reverseComplement) + i + len;
        issues.push(`Potential hairpin formation: sequence "${forward}" at pos ${i}-${i+len-1} has reverse complement "${reverseComplement}" at pos ${matchPos}-${matchPos+reverseComplement.length-1}`);
      }
    }
  }
  
  return issues;
}

/**
 * Gets the reverse complement of a DNA sequence
 * @param {string} seq - DNA sequence
 * @returns {string} - Reverse complement
 */
function getReverseComplement(seq) {
  const complementMap = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };
  return seq.split('').reverse().map(base => complementMap[base]).join('');
}

/**
 * Checks for repetitive elements in the sequence
 * @param {string} sequence - DNA sequence to check
 * @returns {Array} - Array of issues found
 */
function checkForRepeats(sequence) {
  const issues = [];
  const minLength = 6; // Minimum length to consider as repeat
  
  // Check for direct repeats
  for (let len = minLength; len <= Math.min(20, Math.floor(sequence.length / 2)); len++) {
    for (let i = 0; i <= sequence.length - len * 2; i++) {
      const subseq = sequence.substring(i, i + len);
      const nextOccurrence = sequence.indexOf(subseq, i + len);
      
      if (nextOccurrence !== -1) {
        const distance = nextOccurrence - i;
        if (distance <= len * 3) { // If repeats are close together
          issues.push(`Direct repeat detected: "${subseq}" appears at positions ${i}-${i+len-1} and ${nextOccurrence}-${nextOccurrence+len-1}`);
        }
      }
    }
  }
  
  return issues;
}

/**
 * Comprehensive validation of biological sequences
 * @param {string} sequence - Sequence to validate
 * @returns {Object} - Full validation report
 */
export function validateBiologicalSequence(sequence) {
  // For now, just validate as DNA
  // Could be extended to handle RNA, protein sequences
  return validateDNASequence(sequence);
}

/**
 * Sanitizes a DNA sequence by removing non-DNA characters
 * @param {string} sequence - Raw sequence input
 * @returns {string} - Clean DNA sequence
 */
export function sanitizeDNASequence(sequence) {
  if (!sequence || typeof sequence !== 'string') {
    return '';
  }
  return sequence.toUpperCase().replace(/[^ACGT]/g, '');
}