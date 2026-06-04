/* Main SPA page — orchestrates state machine and API call */
"use client";

import { useState, useCallback } from "react";
import type { AppState, FreshnessResult, ApiResponse, FreshnessLabel } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadState from "@/components/UploadState";
import ScanningState from "@/components/ScanningState";
import ResultState from "@/components/ResultState";

/* Maps API label to English and grade number */
const LABEL_MAP: Record<FreshnessLabel, { label_vi: string; grade: number }> = {
  "Highly Fresh": { label_vi: "Highly Fresh",  grade: 3 },
  "Fresh":        { label_vi: "Fresh",       grade: 2 },
  "Not Fresh":    { label_vi: "Not Fresh",   grade: 1 },
};

export default function FreshScanPage() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [previewUrl, setPreviewUrl]  = useState<string | null>(null);
  const [result, setResult]          = useState<FreshnessResult | null>(null);
  const [error, setError]            = useState<string | null>(null);

  /* Handles file submission — calls proxy → HF Space */
  const handleAnalyze = useCallback(async (file: File) => {
    /* Create object URL for preview before sending */
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    setAppState("scanning");

    const formData = new FormData();
    /* Field name must match FastAPI endpoint: file: UploadFile = File(...) */
    formData.append("file", file);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: ApiResponse = await res.json();

      /* Enrich API response with UI display data */
      const mapped = LABEL_MAP[data.label] ?? { label_vi: data.label, grade: 0 };
      const enriched: FreshnessResult = {
        label:     data.label,
        label_vi:  mapped.label_vi,
        grade:     mapped.grade,
        confidence: data.confidence,
        all_probs:  data.all_probs,
      };

      setResult(enriched);
      setAppState("result");
    } catch (err) {
      console.error("[FreshScan] Inference error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again."
      );
      setAppState("upload");
    }
  }, []);

  /* Resets everything for a new scan */
  const resetState = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setAppState("upload");
  }, [previewUrl]);
  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <Header />

      {/* Content area fills remaining height; overflow-hidden enforces no-scroll SPA */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {appState === "upload" && (
          <UploadState onAnalyze={handleAnalyze} error={error} />
        )}
        {appState === "scanning" && (
          <ScanningState previewUrl={previewUrl} />
        )}
        {appState === "result" && result && (
          <ResultState
            result={result}
            previewUrl={previewUrl}
            onNewScan={resetState}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
