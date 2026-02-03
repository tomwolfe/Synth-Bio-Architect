/**
 * Protocol Agent for generating lab protocols and robot instructions
 * Creates Opentrons-compatible protocols and lab procedures
 */

/**
 * Generates a laboratory protocol based on experimental design
 * @param {string} experimentalDesign - The experimental design description
 * @param {Array} materials - List of required materials/reagents
 * @returns {Object} - Protocol with steps and robot instructions
 */
export function generateLabProtocol(experimentalDesign, materials = []) {
  const protocol = {
    title: 'Generated Lab Protocol',
    description: 'Automatically generated from experimental design',
    steps: [],
    robotInstructions: [],
    estimatedTime: 0,
    safetyNotes: []
  };

  // Parse the experimental design to extract protocol steps
  const parsedSteps = parseExperimentalDesign(experimentalDesign);
  
  // Convert to lab protocol steps
  protocol.steps = parsedSteps.labSteps;
  protocol.robotInstructions = parsedSteps.robotInstructions;
  protocol.estimatedTime = parsedSteps.estimatedTime;
  protocol.safetyNotes = parsedSteps.safetyNotes;

  // Add material preparation steps
  if (materials.length > 0) {
    const prepSteps = generateMaterialPreparation(materials);
    protocol.steps.unshift(...prepSteps.prepSteps);
    protocol.robotInstructions.unshift(...prepSteps.robotInstructions);
    protocol.estimatedTime += prepSteps.timeEstimate;
  }

  return protocol;
}

/**
 * Parses experimental design to extract protocol steps
 * @param {string} design - Experimental design text
 * @returns {Object} - Parsed steps and instructions
 */
function parseExperimentalDesign(design) {
  const steps = [];
  const robotInstructions = [];
  let estimatedTime = 0;
  const safetyNotes = [];

  // Identify common experimental procedures in the design
  const designLower = design.toLowerCase();

  // PCR reaction steps
  if (designLower.includes('pcr') || designLower.includes('polymerase chain reaction')) {
    steps.push(
      { step: 1, action: 'Set up PCR reaction mix', time: 5 },
      { step: 2, action: 'Add primers and template DNA', time: 2 },
      { step: 3, action: 'Run PCR program (typically 1-2 hours)', time: 90 }
    );
    robotInstructions.push(
      'robot.move_to_tube_rack("A1")',
      'robot.aspirate(volume=20, rate=0.5)',
      'robot.dispense(volume=20, rate=0.5, location="B1")'
    );
    estimatedTime += 100; // 100 minutes
  }

  // Transformation steps
  if (designLower.includes('transformation') || designLower.includes('competent cells')) {
    steps.push(
      { step: 4, action: 'Thaw competent cells on ice', time: 10 },
      { step: 5, action: 'Add DNA to competent cells', time: 2 },
      { step: 6, action: 'Incubate on ice for 30 minutes', time: 30 },
      { step: 7, action: 'Heat shock at 42°C for 30 seconds', time: 1 },
      { step: 8, action: 'Return to ice for 2 minutes', time: 2 },
      { step: 9, action: 'Add SOC media and incubate at 37°C for 1 hour', time: 65 }
    );
    estimatedTime += 110; // 110 minutes
  }

  // Plasmid purification
  if (designLower.includes('plasmid') || designLower.includes('purification')) {
    steps.push(
      { step: 10, action: 'Grow bacterial culture overnight', time: 180 },
      { step: 11, action: 'Pellet bacteria by centrifugation', time: 10 },
      { step: 12, action: 'Perform alkaline lysis plasmid prep', time: 30 }
    );
    estimatedTime += 220; // 220 minutes
  }

  // Gel electrophoresis
  if (designLower.includes('gel') || designLower.includes('electrophoresis')) {
    steps.push(
      { step: 13, action: 'Prepare agarose gel (1-2%)', time: 20 },
      { step: 14, action: 'Load samples with loading dye', time: 5 },
      { step: 15, action: 'Run gel at 100V for 45-60 minutes', time: 60 },
      { step: 16, action: 'Visualize under UV transilluminator', time: 5 }
    );
    estimatedTime += 90; // 90 minutes
  }

  // Add safety notes based on procedures
  if (designLower.includes('pcr')) {
    safetyNotes.push('Handle DNA polymerase enzymes with care, store properly at -20°C');
  }
  if (designLower.includes('gel') || designLower.includes('ethidium bromide')) {
    safetyNotes.push('Use appropriate UV protection when visualizing gels');
  }
  if (designLower.includes('antibiotic')) {
    safetyNotes.push('Dispose of antibiotic-containing waste according to institutional guidelines');
  }

  return {
    labSteps: steps,
    robotInstructions: robotInstructions,
    estimatedTime,
    safetyNotes
  };
}

/**
 * Generates material preparation steps
 * @param {Array} materials - List of required materials
 * @returns {Object} - Preparation steps
 */
function generateMaterialPreparation(materials) {
  const prepSteps = [];
  const robotInstructions = [];
  let timeEstimate = 0;

  prepSteps.push({ step: 0, action: 'Gather and check all required materials', time: 10 });
  timeEstimate += 10;

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    prepSteps.push({
      step: i + 0.1,
      action: `Prepare ${material.name || `Material ${i+1}`}: ${material.amount || 'as needed'}`,
      time: material.prepTime || 5
    });
    timeEstimate += material.prepTime || 5;
  }

  return {
    prepSteps,
    robotInstructions,
    timeEstimate
  };
}

/**
 * Generates OpenTrons-compatible Python protocol
 * @param {Object} protocol - Protocol object
 * @returns {string} - OpenTrons Python code
 */
export function generateOpenTronsProtocol(protocol) {
  let otProtocol = `from opentrons import protocol_api

# Metadata
metadata = {
    'protocolName': '${protocol.title}',
    'author': 'SynthBioArchitect AI',
    'description': '''${protocol.description}''',
    'apiLevel': '2.11'
}

def run(protocol: protocol_api.ProtocolContext):
    # Labware
    tiprack_20 = protocol.load_labware('opentrons_96_tiprack_20ul', '1')
    plate_96 = protocol.load_labware('corning_96_wellplate_360ul_flat', '2')
    temp_deck = protocol.load_module('temperature module', '3')
    temp_plate = temp_deck.load_labware('opentrons_96_aluminumblock_generic_pcr_strip_200ul')

    # Pipettes
    p20_single = protocol.load_instrument('p20_single_gen2', 'right', tip_racks=[tiprack_20])

    # Temperature module
    temp_deck.set_temperature(4)  # Chill for enzyme reactions

    # Protocol steps
`;

  for (const step of protocol.steps) {
    otProtocol += `    # Step ${step.step}: ${step.action}\n`;
    otProtocol += `    # Estimated time: ${step.time} minutes\n`;
    otProtocol += `    # TODO: Implement specific robot movements for this step\n\n`;
  }

  otProtocol += `    # Return tips to rack\n`;
  otProtocol += `    # p20_single.return_tip()\n\n`;
  otProtocol += `    # End of protocol\n`;

  return otProtocol;
}

/**
 * Generates a comprehensive lab protocol document
 * @param {string} experimentalDesign - Experimental design
 * @param {Array} materials - Required materials
 * @returns {string} - Complete protocol in markdown format
 */
export function generateProtocolDocument(experimentalDesign, materials = []) {
  const protocol = generateLabProtocol(experimentalDesign, materials);
  const otProtocol = generateOpenTronsProtocol(protocol);

  let doc = `# Laboratory Protocol\n\n`;
  doc += `**Title:** ${protocol.title}\n\n`;
  doc += `**Description:** ${protocol.description}\n\n`;
  doc += `**Estimated Time:** ~${Math.ceil(protocol.estimatedTime / 60)} hours ${protocol.estimatedTime % 60} minutes\n\n`;

  doc += `## Materials Required\n\n`;
  if (materials.length > 0) {
    for (const material of materials) {
      doc += `- ${material.name}: ${material.amount || 'as needed'}\n`;
    }
  } else {
    doc += `- See experimental design for materials list\n`;
  }
  doc += `\n`;

  doc += `## Protocol Steps\n\n`;
  for (const step of protocol.steps) {
    doc += `### Step ${step.step}\n`;
    doc += `- **Action:** ${step.action}\n`;
    doc += `- **Time:** ~${step.time} minutes\n\n`;
  }

  if (protocol.safetyNotes.length > 0) {
    doc += `## Safety Notes\n\n`;
    for (const note of protocol.safetyNotes) {
      doc += `- ${note}\n`;
    }
    doc += `\n`;
  }

  doc += `## Robot Instructions (OpenTrons)\n\n`;
  doc += '```python\n';
  doc += otProtocol;
  doc += '\n```\n';

  return doc;
}

/**
 * ProtocolAgent class for encapsulating protocol generation functionality
 */
export class ProtocolAgent {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Generate a lab protocol from experimental design
   * @param {string} design - Experimental design
   * @param {Array} materials - Required materials
   * @returns {Object} - Generated protocol
   */
  async generateProtocol(design, materials = []) {
    return generateLabProtocol(design, materials);
  }

  /**
   * Generate a complete protocol document
   * @param {string} design - Experimental design
   * @param {Array} materials - Required materials
   * @returns {string} - Protocol document
   */
  async generateDocument(design, materials = []) {
    return generateProtocolDocument(design, materials);
  }

  /**
   * Generate OpenTrons-compatible protocol
   * @param {Object} protocol - Protocol object
   * @returns {string} - OpenTrons code
   */
  async generateRobotProtocol(protocol) {
    return generateOpenTronsProtocol(protocol);
  }
}