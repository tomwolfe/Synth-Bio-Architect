import { z } from 'zod';

export const HypothesisSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(10, 'Hypothesis title must be at least 10 characters'),
  description: z.string().min(50, 'Hypothesis description must be at least 50 characters'),
  rationale: z.string().min(20, 'Rationale must be at least 20 characters'),
  novelty: z.string().min(10, 'Novelty statement must be at least 10 characters'),
  predictedOutcome: z.string().min(20, 'Predicted outcome must be at least 20 characters')
});

export const BillOfMaterialsSchema = z.object({
  reagents: z.array(z.string()).min(1, 'At least one reagent is required'),
  equipment: z.array(z.string()).min(1, 'At least one equipment item is required'),
  buffers: z.array(z.string()).min(0),
  solvents: z.array(z.string()).min(0)
});

export const ExperimentalDesignSchema = z.object({
  title: z.string().min(10, 'Experimental design title must be at least 10 characters'),
  objective: z.string().min(50, 'Objective must be at least 50 characters'),
  methodology: z.string().min(100, 'Methodology must be at least 100 characters'),
  controls: z.array(z.string()).min(1, 'At least one control is required'),
  readouts: z.array(z.string()).min(1, 'At least one readout method is required'),
  expectedTimeline: z.string().min(20, 'Timeline must be at least 20 characters'),
  risks: z.array(z.string()).min(0),
  billOfMaterials: BillOfMaterialsSchema
});

export const GrantProposalSchema = z.object({
  title: z.string().min(15, 'Grant proposal title must be at least 15 characters'),
  abstract: z.string().min(100, 'Abstract must be at least 100 characters'),
  significance: z.string().min(50, 'Significance must be at least 50 characters'),
  innovation: z.string().min(50, 'Innovation must be at least 50 characters'),
  approach: z.string().min(150, 'Approach must be at least 150 characters'),
  budgetSummary: z.string().min(30, 'Budget summary must be at least 30 characters'),
  predictedImpactScore: z.number().min(0).max(100, 'Impact score must be between 0-100'),
  impactJustification: z.string().min(30, 'Impact justification must be at least 30 characters')
});

export const ResearchResponseSchema = z.object({
  hypotheses: z.array(HypothesisSchema).min(3, 'At least 3 hypotheses are required'),
  experimentalDesign: ExperimentalDesignSchema,
  grantProposal: GrantProposalSchema
});
