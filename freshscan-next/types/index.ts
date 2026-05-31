/* Shared TypeScript types for FreshScan AI */

/** Three freshness classes returned by the FastAPI backend */
export type FreshnessLabel = "Highly Fresh" | "Fresh" | "Not Fresh";

/** Raw API response from POST /predict */
export interface ApiResponse {
  label: FreshnessLabel;
  confidence: number;
  all_probs: Record<FreshnessLabel, number>;
}

/** Enriched result used by UI components */
export interface FreshnessResult {
  label: FreshnessLabel;
  label_vi: string;
  grade: number;       // 3 = Highly Fresh, 2 = Fresh, 1 = Not Fresh
  confidence: number;  // 0.0 – 1.0
  all_probs: Record<FreshnessLabel, number>;
}

/** App state machine states */
export type AppState = "upload" | "scanning" | "result";

/** Per-grade display config */
export interface GradeConfig {
  label: FreshnessLabel;
  label_vi: string;
  grade: number;
  color: string;
  description: string;
}
