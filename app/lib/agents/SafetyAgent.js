/**
 * Safety Agent for biosecurity screening
 * Implements biosecurity checks on generated biological sequences
 */

/**
 * Performs biosecurity screening on biological sequences
 * @param {string} sequence - DNA/RNA sequence to screen
 * @param {string} designDescription - Description of the biological design
 * @returns {Object} - Screening results with potential risks
 */
export function performBiosecurityScreening(sequence, designDescription) {
  const results = {
    isSafe: true,
    issues: [],
    recommendations: []
  };

  // Check for known hazardous sequence patterns
  const hazardousPatterns = [
    { pattern: /ATGCCATCAGCCATTGCTTCTGTT/, name: 'Toxin gene fragment', risk: 'high' },
    { pattern: /GGCGAAGAGCTTTACGCCGATGAC/, name: 'Pathogen virulence factor', risk: 'high' },
    { pattern: /TCTGAGTCACCTCCTGCAG/, name: 'Antibiotic resistance gene', risk: 'medium' },
    // Add more hazardous patterns as needed
  ];

  // Check for hazardous patterns in the sequence
  for (const hazard of hazardousPatterns) {
    if (sequence && sequence.toUpperCase().match(hazard.pattern)) {
      results.isSafe = false;
      results.issues.push({
        type: 'hazardous_pattern',
        name: hazard.name,
        risk: hazard.risk,
        message: `Hazardous pattern detected: ${hazard.name}`
      });
    }
  }

  // Check for potential dual-use research concerns
  const dualUseKeywords = [
    'toxin', 'venom', 'pathogen', 'virulence', 'resistance', 'lethal', 'fatal', 'deadly'
  ];
  
  if (designDescription) {
    const lowerDesc = designDescription.toLowerCase();
    for (const keyword of dualUseKeywords) {
      if (lowerDesc.includes(keyword)) {
        results.issues.push({
          type: 'dual_use_concern',
          name: keyword,
          risk: 'medium',
          message: `Dual-use research concern detected: ${keyword} mentioned in design`
        });
      }
    }
  }

  // Check for unusual codon usage that might indicate synthesis of viral proteins
  if (sequence) {
    const codonAnalysis = analyzeCodonUsage(sequence);
    if (codonAnalysis.unusualPatterns.length > 0) {
      results.issues.push({
        type: 'codon_usage',
        name: 'Unusual codon usage',
        risk: 'low',
        message: `Unusual codon patterns detected that may indicate non-native protein synthesis`,
        details: codonAnalysis.unusualPatterns
      });
    }
  }

  // Generate recommendations based on findings
  if (results.issues.length > 0) {
    results.recommendations.push(
      'Review all identified hazards with institutional biosafety committee',
      'Consider redesigning sequences to remove hazardous elements',
      'Implement additional containment measures if proceeding'
    );
  } else {
    results.recommendations.push(
      'No significant biosecurity risks identified',
      'Proceed with standard laboratory safety protocols'
    );
  }

  return results;
}

/**
 * Analyzes codon usage for unusual patterns
 * @param {string} sequence - DNA sequence to analyze
 * @returns {Object} - Analysis results
 */
function analyzeCodonUsage(sequence) {
  const unusualPatterns = [];
  
  // Look for long stretches of rare codons that might indicate foreign genes
  // This is a simplified analysis - real implementation would use organism-specific codon tables
  
  // Check for long homopolymeric stretches (already done in validation, but adding here too)
  const homopolymerRegex = /(A{7,}|C{7,}|G{7,}|T{7,})/;
  if (homopolymerRegex.test(sequence)) {
    unusualPatterns.push('Long homopolymeric stretches detected');
  }
  
  // Look for repetitive elements
  const repeatRegex = /([ACGT]{6,})\1{2,}/i; // Repeating 6+ base sequence 3+ times
  if (repeatRegex.test(sequence)) {
    unusualPatterns.push('Highly repetitive sequences detected');
  }
  
  return {
    unusualPatterns,
    totalLength: sequence.length
  };
}

/**
 * Generates a safety report for the given sequence and design
 * @param {string} sequence - DNA/RNA sequence
 * @param {string} designDescription - Design description
 * @returns {string} - Safety report in markdown format
 */
export function generateSafetyReport(sequence, designDescription) {
  const screeningResults = performBiosecurityScreening(sequence, designDescription);
  
  let report = `# Biosecurity Screening Report\n\n`;
  report += `**Status:** ${screeningResults.isSafe ? '✅ Safe' : '⚠️ Issues Identified'}\n\n`;
  
  if (screeningResults.issues.length > 0) {
    report += `## Identified Issues\n\n`;
    for (const issue of screeningResults.issues) {
      report += `- **${issue.name}** (${issue.risk}): ${issue.message}\n`;
      if (issue.details) {
        report += `  - Details: ${issue.details.join(', ')}\n`;
      }
    }
    report += `\n`;
  }
  
  report += `## Recommendations\n\n`;
  for (const recommendation of screeningResults.recommendations) {
    report += `- ${recommendation}\n`;
  }
  
  return report;
}

/**
 * SafetyAgent class for encapsulating biosecurity functionality
 */
export class SafetyAgent {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Screen a biological design for safety concerns
   * @param {Object} design - Design object with sequence and description
   * @returns {Object} - Screening results
   */
  async screenDesign(design) {
    const { sequence, description } = design;
    return performBiosecurityScreening(sequence, description);
  }

  /**
   * Generate a safety report for a design
   * @param {Object} design - Design object with sequence and description
   * @returns {string} - Safety report
   */
  async generateReport(design) {
    const { sequence, description } = design;
    return generateSafetyReport(sequence, description);
  }
}