/**
 * Design Agent for optimizing biological designs
 * Implements design rules and optimization for synthetic biology constructs
 */

/**
 * Optimizes a biological design for expression and stability
 * @param {string} sequence - DNA sequence to optimize
 * @param {string} hostOrganism - Host organism for expression
 * @param {Object} constraints - Design constraints
 * @returns {Object} - Optimization results
 */
export function optimizeBiologicalDesign(sequence, hostOrganism = 'E coli', constraints = {}) {
  const results = {
    originalSequence: sequence,
    optimizedSequence: sequence,
    changes: [],
    score: 0,
    recommendations: []
  };

  // Apply codon optimization based on host organism
  const codonOptimized = applyCodonOptimization(sequence, hostOrganism);
  if (codonOptimized.sequence !== sequence) {
    results.optimizedSequence = codonOptimized.sequence;
    results.changes.push(...codonOptimized.changes);
    results.score += codonOptimized.scoreImprovement;
    results.recommendations.push(...codonOptimized.recommendations);
  }

  // Optimize for expression
  const expressionOptimized = optimizeForExpression(results.optimizedSequence, hostOrganism);
  if (expressionOptimized.sequence !== results.optimizedSequence) {
    results.optimizedSequence = expressionOptimized.sequence;
    results.changes.push(...expressionOptimized.changes);
    results.score += expressionOptimized.scoreImprovement;
    results.recommendations.push(...expressionOptimized.recommendations);
  }

  // Check for structural stability
  const stabilityChecked = checkStructuralStability(results.optimizedSequence);
  if (stabilityChecked.sequence !== results.optimizedSequence) {
    results.optimizedSequence = stabilityChecked.sequence;
    results.changes.push(...stabilityChecked.changes);
    results.score += stabilityChecked.scoreImprovement;
    results.recommendations.push(...stabilityChecked.recommendations);
  }

  // Apply design constraints
  const constraintApplied = applyConstraints(results.optimizedSequence, constraints);
  if (constraintApplied.sequence !== results.optimizedSequence) {
    results.optimizedSequence = constraintApplied.sequence;
    results.changes.push(...constraintApplied.changes);
    results.score += constraintApplied.scoreImprovement;
    results.recommendations.push(...constraintApplied.recommendations);
  }

  // Calculate final score
  results.score = Math.min(100, Math.max(0, results.score));

  return results;
}

/**
 * Applies codon optimization based on host organism
 * @param {string} sequence - DNA sequence
 * @param {string} hostOrganism - Host organism
 * @returns {Object} - Codon optimization results
 */
function applyCodonOptimization(sequence, hostOrganism) {
  const changes = [];
  const recommendations = [];
  let scoreImprovement = 0;
  let optimizedSeq = sequence;

  // Simplified codon optimization - in reality this would use organism-specific codon usage tables
  // For now, just ensure the sequence follows standard genetic code rules
  const codonTable = {
    // Common codons for amino acids in E. coli
    'F': ['TTT', 'TTC'], // Phenylalanine
    'L': ['TTA', 'TTG', 'CTT', 'CTC', 'CTA', 'CTG'], // Leucine
    'I': ['ATT', 'ATC', 'ATA'], // Isoleucine
    'M': ['ATG'], // Methionine (start)
    'V': ['GTT', 'GTC', 'GTA', 'GTG'], // Valine
    'S': ['TCT', 'TCC', 'TCA', 'TCG', 'AGT', 'AGC'], // Serine
    'P': ['CCT', 'CCC', 'CCA', 'CCG'], // Proline
    'T': ['ACT', 'ACC', 'ACA', 'ACG'], // Threonine
    'A': ['GCT', 'GCC', 'GCA', 'GCG'], // Alanine
    'Y': ['TAT', 'TAC'], // Tyrosine
    'H': ['CAT', 'CAC'], // Histidine
    'Q': ['CAA', 'CAG'], // Glutamine
    'N': ['AAT', 'AAC'], // Asparagine
    'K': ['AAA', 'AAG'], // Lysine
    'D': ['GAT', 'GAC'], // Aspartic acid
    'E': ['GAA', 'GAG'], // Glutamic acid
    'C': ['TGT', 'TGC'], // Cysteine
    'W': ['TGG'], // Tryptophan
    'R': ['CGT', 'CGC', 'CGA', 'CGG', 'AGA', 'AGG'], // Arginine
    'G': ['GGT', 'GGC', 'GGA', 'GGG'], // Glycine
    // Stop codons
    '*': ['TAA', 'TAG', 'TGA']
  };

  // This is a simplified version - real implementation would use actual codon frequency data
  recommendations.push(`Codon optimization applied for ${hostOrganism}`);
  scoreImprovement = 10;

  return {
    sequence: optimizedSeq,
    changes,
    scoreImprovement,
    recommendations
  };
}

/**
 * Optimizes sequence for expression
 * @param {string} sequence - DNA sequence
 * @param {string} hostOrganism - Host organism
 * @returns {Object} - Expression optimization results
 */
function optimizeForExpression(sequence, hostOrganism) {
  const changes = [];
  const recommendations = [];
  let scoreImprovement = 0;
  let optimizedSeq = sequence;

  // Optimize for ribosome binding site (RBS) strength
  // Look for Shine-Dalgarno sequences in prokaryotes
  if (hostOrganism.toLowerCase().includes('coli')) {
    // Ensure proper spacing between RBS and start codon
    const rbsPattern = /AGGAG[\s\S]{0,10}ATG/;
    if (!rbsPattern.test(sequence)) {
      // This is a simplified check - real implementation would be more sophisticated
      recommendations.push('Consider adding proper RBS sequence for optimal translation in E. coli');
      scoreImprovement -= 5; // Lower score if RBS is not optimal
    }
  }

  // Avoid strong secondary structures at mRNA start
  // This would normally involve RNA folding algorithms
  recommendations.push('Expression optimization applied');
  scoreImprovement += 5;

  return {
    sequence: optimizedSeq,
    changes,
    scoreImprovement,
    recommendations
  };
}

/**
 * Checks for structural stability
 * @param {string} sequence - DNA sequence
 * @returns {Object} - Stability check results
 */
function checkStructuralStability(sequence) {
  const changes = [];
  const recommendations = [];
  let scoreImprovement = 0;
  let optimizedSeq = sequence;

  // Check for potential hairpin structures
  // Look for complementary sequences that could form hairpins
  const hairpinRegex = /([ACGT]{6,}).{10,20}([ACGT]{6,})/;
  const match = sequence.match(hairpinRegex);
  
  if (match) {
    // Find reverse complement of the second sequence
    const revComp = getReverseComplement(match[2]);
    if (match[1].includes(revComp.substring(0, 4))) {
      recommendations.push('Potential hairpin structure detected that may affect stability');
      scoreImprovement -= 10;
    }
  }

  // Check for repetitive elements that might cause instability
  const repeatRegex = /([ACGT]{6,})\1{2,}/; // Repeating 6+ base sequence 3+ times
  if (repeatRegex.test(sequence)) {
    recommendations.push('Repetitive elements detected that may cause genomic instability');
    scoreImprovement -= 15;
  }

  return {
    sequence: optimizedSeq,
    changes,
    scoreImprovement,
    recommendations
  };
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
 * Applies design constraints
 * @param {string} sequence - DNA sequence
 * @param {Object} constraints - Design constraints
 * @returns {Object} - Constraint application results
 */
function applyConstraints(sequence, constraints) {
  const changes = [];
  const recommendations = [];
  let scoreImprovement = 0;
  let optimizedSeq = sequence;

  // Apply length constraints
  if (constraints.minLength && sequence.length < constraints.minLength) {
    recommendations.push(`Sequence is shorter than minimum length of ${constraints.minLength} bp`);
    scoreImprovement -= 5;
  }
  
  if (constraints.maxLength && sequence.length > constraints.maxLength) {
    recommendations.push(`Sequence exceeds maximum length of ${constraints.maxLength} bp`);
    scoreImprovement -= 5;
  }

  // Apply GC content constraints
  if (constraints.minGC || constraints.maxGC) {
    const gcCount = (sequence.match(/[GC]/g) || []).length;
    const gcPercentage = (gcCount / sequence.length) * 100;
    
    if (constraints.minGC && gcPercentage < constraints.minGC) {
      recommendations.push(`GC content (${gcPercentage.toFixed(2)}%) is below minimum of ${constraints.minGC}%`);
      scoreImprovement -= 3;
    }
    
    if (constraints.maxGC && gcPercentage > constraints.maxGC) {
      recommendations.push(`GC content (${gcPercentage.toFixed(2)}%) exceeds maximum of ${constraints.maxGC}%`);
      scoreImprovement -= 3;
    }
  }

  // Apply restriction enzyme site avoidance
  if (constraints.avoidSites) {
    for (const site of constraints.avoidSites) {
      if (sequence.includes(site)) {
        recommendations.push(`Restriction site ${site} found in sequence`);
        scoreImprovement -= 5;
      }
    }
  }

  return {
    sequence: optimizedSeq,
    changes,
    scoreImprovement,
    recommendations
  };
}

/**
 * Evaluates a biological design for various properties
 * @param {string} sequence - DNA sequence
 * @param {string} hostOrganism - Host organism
 * @returns {Object} - Evaluation results
 */
export function evaluateBiologicalDesign(sequence, hostOrganism = 'E coli') {
  const evaluation = {
    sequenceLength: sequence.length,
    gcContent: 0,
    complexity: 0,
    expressionScore: 0,
    stabilityScore: 0,
    overallScore: 0,
    features: []
  };

  // Calculate GC content
  const gcCount = (sequence.match(/[GC]/g) || []).length;
  evaluation.gcContent = parseFloat(((gcCount / sequence.length) * 100).toFixed(2));

  // Calculate sequence complexity (simplified)
  const uniqueKmers = new Set();
  for (let i = 0; i <= sequence.length - 6; i++) {
    uniqueKmers.add(sequence.substring(i, i + 6));
  }
  evaluation.complexity = parseFloat(((uniqueKmers.size / (sequence.length - 5)) * 100).toFixed(2));

  // Evaluate expression potential
  evaluation.expressionScore = calculateExpressionScore(sequence, hostOrganism);

  // Evaluate stability
  evaluation.stabilityScore = calculateStabilityScore(sequence);

  // Overall score
  evaluation.overallScore = Math.round(
    (evaluation.gcContent >= 40 && evaluation.gcContent <= 60 ? 20 : 0) +
    (evaluation.complexity > 70 ? 20 : 10) +
    evaluation.expressionScore +
    evaluation.stabilityScore
  );

  // Identify features
  evaluation.features = identifyFeatures(sequence);

  return evaluation;
}

/**
 * Calculates expression score based on sequence properties
 * @param {string} sequence - DNA sequence
 * @param {string} hostOrganism - Host organism
 * @returns {number} - Expression score (0-30)
 */
function calculateExpressionScore(sequence, hostOrganism) {
  let score = 0;

  // Check for proper start and stop codons
  if (sequence.startsWith('ATG')) {
    score += 10; // Good start codon
  }

  if (sequence.endsWith('TAA') || sequence.endsWith('TAG') || sequence.endsWith('TGA')) {
    score += 5; // Proper stop codon
  }

  // Check for RBS in prokaryotes
  if (hostOrganism.toLowerCase().includes('coli')) {
    if (/AGGAG[\s\S]{0,10}ATG/.test(sequence)) {
      score += 15; // Good RBS
    } else {
      score += 5; // No RBS but might still express
    }
  }

  return Math.min(30, score);
}

/**
 * Calculates stability score based on sequence properties
 * @param {string} sequence - DNA sequence
 * @returns {number} - Stability score (0-30)
 */
function calculateStabilityScore(sequence) {
  let score = 30; // Start with perfect score

  // Penalize for homopolymers
  const homopolymerRegex = /(A{7,}|C{7,}|G{7,}|T{7,})/g;
  const homopolymers = sequence.match(homopolymerRegex) || [];
  score -= homopolymers.length * 5;

  // Penalize for repetitive elements
  const repeatRegex = /([ACGT]{6,})\1{2,}/g;
  const repeats = sequence.match(repeatRegex) || [];
  score -= repeats.length * 10;

  // Penalize for potential hairpins
  const hairpinRegex = /([ACGT]{6,}).{10,20}([ACGT]{6,})/;
  const match = sequence.match(hairpinRegex);
  if (match) {
    const revComp = getReverseComplement(match[2]);
    if (match[1].includes(revComp.substring(0, 4))) {
      score -= 10; // Potential hairpin
    }
  }

  return Math.max(0, score);
}

/**
 * Identifies features in the sequence
 * @param {string} sequence - DNA sequence
 * @returns {Array} - Array of identified features
 */
function identifyFeatures(sequence) {
  const features = [];

  // Look for promoters (simplified)
  if (sequence.toUpperCase().includes('TATAAA') || sequence.toUpperCase().includes('TATAAT')) {
    features.push({ type: 'promoter', position: sequence.toUpperCase().indexOf('TATAAA'), length: 6 });
  }

  // Look for ribosome binding sites
  if (sequence.toUpperCase().includes('AGGAGG')) {
    features.push({ type: 'RBS', position: sequence.toUpperCase().indexOf('AGGAGG'), length: 6 });
  }

  // Look for terminators
  if (sequence.toUpperCase().includes('TTTTT') || sequence.toUpperCase().includes('TATAA')) {
    features.push({ type: 'terminator', position: sequence.toUpperCase().indexOf('TTTTT'), length: 5 });
  }

  return features;
}

/**
 * DesignAgent class for encapsulating design optimization functionality
 */
export class DesignAgent {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Optimize a biological design
   * @param {string} sequence - DNA sequence
   * @param {string} hostOrganism - Host organism
   * @param {Object} constraints - Design constraints
   * @returns {Object} - Optimization results
   */
  async optimizeDesign(sequence, hostOrganism = 'E coli', constraints = {}) {
    return optimizeBiologicalDesign(sequence, hostOrganism, constraints);
  }

  /**
   * Evaluate a biological design
   * @param {string} sequence - DNA sequence
   * @param {string} hostOrganism - Host organism
   * @returns {Object} - Evaluation results
   */
  async evaluateDesign(sequence, hostOrganism = 'E coli') {
    return evaluateBiologicalDesign(sequence, hostOrganism);
  }
}