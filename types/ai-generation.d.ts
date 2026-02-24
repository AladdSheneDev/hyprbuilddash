export interface AiGenerationImageInput {
  id?: string;
  url?: string;
  dataUrl?: string;
  mimeType?: string;
}

export interface AiGenerationRequest {
  projectId: string;
  userRequest: string;
  images?: AiGenerationImageInput[];
}

export interface AiGenerationTester {
  status?: 'pass' | 'fail' | string;
  issues?: Array<string | { message?: string; title?: string; [key: string]: unknown }>;
  score?: number;
  [key: string]: unknown;
}

export interface AiGenerationUsage {
  totalCalls?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  byAgent?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AiGenerationResponse {
  status?: 'success' | 'failed' | string;
  projectId?: string;
  chainDepth?: number;
  planner?: Record<string, unknown> | string;
  backend?: Record<string, unknown>;
  pages?: Array<Record<string, unknown> | string>;
  tester?: AiGenerationTester;
  usage?: AiGenerationUsage;
  refinementCycles?: number;
  [key: string]: unknown;
}
