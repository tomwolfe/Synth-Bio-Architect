// Verification script to test the parsing logic against various simulated LLM outputs

// Import the parsing function from MainContent.js
// Since this is a standalone script, we'll recreate the function here for testing purposes
const parseResponseIntoSections = (text) => {
  // Case-insensitive regex with flexible whitespace handling
  const hypothesesMatch = text.match(/PHASE\s*1\s*[:\-]?\s*(?:HYPOTHESES|HYPOTHESIS)([\s\S]*?)(?=PHASE\s*\d\s*[:\-]?\s*(?:EXPERIMENTAL DESIGN|GRANT PROPOSAL)|$)/i);
  const experimentalDesignMatch = text.match(/PHASE\s*2\s*[:\-]?\s*(?:EXPERIMENTAL DESIGN|EXPERIMENT)([\s\S]*?)(?=PHASE\s*\d\s*[:\-]?\s*(?:HYPOTHESES?|GRANT PROPOSAL)|$)/i);
  const grantProposalMatch = text.match(/PHASE\s*3\s*[:\-]?\s*(?:GRANT PROPOSAL|PROPOSAL)([\s\S]*)/i);

  return {
    hypotheses: hypothesesMatch ? hypothesesMatch[1].trim() : 'Section pending...',
    experimentalDesign: experimentalDesignMatch ? experimentalDesignMatch[1].trim() : 'Section pending...',
    grantProposal: grantProposalMatch ? grantProposalMatch[1].trim() : 'Section pending...'
  };
};

// Define 3 mock LLM strings for testing
const mockResponses = {
  perfect: `1. PHASE 1: HYPOTHESES
This is the hypotheses section content.
It contains multiple lines of text.
With important research ideas.

2. PHASE 2: EXPERIMENTAL DESIGN
This is the experimental design section content.
It details the methodology.
And materials needed.

3. PHASE 3: GRANT PROPOSAL
This is the grant proposal section content.
It includes budget information.
And timeline details.`,

  lowercase: `1. phase 1: hypotheses
This is the hypotheses section content in lowercase.
It contains multiple lines of text.
With important research ideas.

2. phase 2: experimental design
This is the experimental design section content in lowercase.
It details the methodology.
And materials needed.

3. phase 3: grant proposal
This is the grant proposal section content in lowercase.
It includes budget information.
And timeline details.`,

  extraNewlines: `1. PHASE 1: HYPOTHESES


This is the hypotheses section content with extra newlines.
It contains multiple lines of text.
With important research ideas.


2. PHASE 2: EXPERIMENTAL DESIGN


This is the experimental design section content with extra newlines.
It details the methodology.
And materials needed.


3. PHASE 3: GRANT PROPOSAL


This is the grant proposal section content with extra newlines.
It includes budget information.
And timeline details.`
};

// Test function
function runTests() {
  console.log('Running parser verification tests...\n');

  // Test 1: Perfect formatting
  console.log('Test 1: Perfect formatting');
  const result1 = parseResponseIntoSections(mockResponses.perfect);
  console.log('Hypotheses:', result1.hypotheses.substring(0, 50) + '...');
  console.log('Experimental Design:', result1.experimentalDesign.substring(0, 50) + '...');
  console.log('Grant Proposal:', result1.grantProposal.substring(0, 50) + '...');
  console.log('Status:', 
    result1.hypotheses.includes('This is the hypotheses section') &&
    result1.experimentalDesign.includes('This is the experimental design section') &&
    result1.grantProposal.includes('This is the grant proposal section') 
      ? '✅ PASSED' : '❌ FAILED');
  console.log('');

  // Test 2: Lowercase formatting
  console.log('Test 2: Lowercase formatting');
  const result2 = parseResponseIntoSections(mockResponses.lowercase);
  console.log('Hypotheses:', result2.hypotheses.substring(0, 50) + '...');
  console.log('Experimental Design:', result2.experimentalDesign.substring(0, 50) + '...');
  console.log('Grant Proposal:', result2.grantProposal.substring(0, 50) + '...');
  console.log('Status:', 
    result2.hypotheses.includes('This is the hypotheses section') &&
    result2.experimentalDesign.includes('This is the experimental design section') &&
    result2.grantProposal.includes('This is the grant proposal section') 
      ? '✅ PASSED' : '❌ FAILED');
  console.log('');

  // Test 3: Extra newlines
  console.log('Test 3: Extra newlines');
  const result3 = parseResponseIntoSections(mockResponses.extraNewlines);
  console.log('Hypotheses:', result3.hypotheses.substring(0, 50) + '...');
  console.log('Experimental Design:', result3.experimentalDesign.substring(0, 50) + '...');
  console.log('Grant Proposal:', result3.grantProposal.substring(0, 50) + '...');
  console.log('Status:', 
    result3.hypotheses.includes('This is the hypotheses section') &&
    result3.experimentalDesign.includes('This is the experimental design section') &&
    result3.grantProposal.includes('This is the grant proposal section') 
      ? '✅ PASSED' : '❌ FAILED');
  console.log('');

  // Test 4: Missing sections
  console.log('Test 4: Missing sections (should return "Section pending...")');
  const result4 = parseResponseIntoSections('Some random text without proper sections');
  console.log('Hypotheses:', result4.hypotheses);
  console.log('Experimental Design:', result4.experimentalDesign);
  console.log('Grant Proposal:', result4.grantProposal);
  console.log('Status:', 
    result4.hypotheses === 'Section pending...' &&
    result4.experimentalDesign === 'Section pending...' &&
    result4.grantProposal === 'Section pending...' 
      ? '✅ PASSED' : '❌ FAILED');
  console.log('');

  console.log('All tests completed!');
}

// Run the tests
runTests();