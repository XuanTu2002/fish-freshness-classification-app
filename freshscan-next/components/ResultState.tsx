/* ResultState — State 3: Analysis result with image, grade, and probability chart */
"use client";

import type { FreshnessResult } from "@/types";

interface ResultStateProps {
  result: FreshnessResult;
  previewUrl: string | null;
  onNewScan: () => void;
}

/* Ordered grade configs for the 3-class model (best → worst) */
const GRADE_ORDER: Array<{
  label: FreshnessResult["label"];
  label_vi: string;
  grade: number;
  color: string;
  description: string;
}> = [
  {
    label: "Highly Fresh",
    label_vi: "Rất tươi",
    grade: 3,
    color: "#16a34a",
    description: "Specimen shows optimal ocular clarity and corneal integrity.",
  },
  {
    label: "Fresh",
    label_vi: "Tươi",
    grade: 2,
    color: "#d97706",
    description: "Specimen meets acceptable freshness standards.",
  },
  {
    label: "Not Fresh",
    label_vi: "Kém tươi",
    grade: 1,
    color: "#dc2626",
    description: "Specimen shows signs of degradation. Not recommended for consumption.",
  },
];

/* Maps label to its display config */
const getConfig = (label: FreshnessResult["label"]) =>
  GRADE_ORDER.find((g) => g.label === label) ?? GRADE_ORDER[1];

export default function ResultState({
  result,
  previewUrl,
  onNewScan,
}: ResultStateProps) {
  const config = getConfig(result.label);
  const confidencePct = Math.round(result.confidence * 100);

  /* Converts all_probs dict to ordered array for the bar chart */
  const probBars = GRADE_ORDER.map((g) => ({
    ...g,
    prob: result.all_probs[g.label] ?? 0,
  })).reverse(); // show worst → best left to right

  /* Active grade index within the 3-grade scale (bars left to right) */
  const activeBarIndex = GRADE_ORDER.indexOf(config); // 0=Highly Fresh, 1=Fresh, 2=Not Fresh

  return (
    <main
      className="flex flex-1 items-center justify-center w-full animate-fade-in-up"
      style={{
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        paddingLeft: "2rem",
        paddingRight: "2rem",
      }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

        {/* ── Left column: Image preview ── */}
        <div className="md:col-span-5 flex justify-center">
          <div
            className="glass-panel rounded-xl shadow-2xl relative overflow-hidden group w-full"
            style={{ maxWidth: 440 }}
          >
            {/* Hover tint */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "rgba(0, 200, 180, 0.05)" }}
            />

            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Analyzed fish eye"
                className="w-full h-auto aspect-square object-cover rounded-lg border"
                style={{
                  borderColor: "rgba(160, 196, 216, 0.2)",
                  filter: "brightness(0.9) contrast(1.25)",
                }}
              />
            ) : (
              /* Placeholder when no preview */
              <div
                className="w-full aspect-square rounded-lg flex items-center justify-center"
                style={{ background: "rgba(27, 32, 37, 0.8)" }}
              >
                <span
                  className="material-symbols-outlined text-6xl"
                  style={{ color: "rgba(160, 196, 216, 0.3)" }}
                >
                  image
                </span>
              </div>
            )}

            {/* Shimmer scan line over image */}
            <div className="animate-scan-result pointer-events-none" aria-hidden="true" />

            {/* Grade badge overlay */}
            <div
              className="absolute top-3 right-3 px-3 py-1 rounded text-label-caps uppercase"
              style={{
                background: "rgba(10, 15, 20, 0.85)",
                border: `1px solid ${config.color}40`,
                color: config.color,
              }}
            >
              Grade {config.grade}
            </div>
          </div>
        </div>

        {/* ── Right column: Analysis panel ── */}
        <div className="md:col-span-7">
          <div
            className="glass-panel rounded-xl w-full flex flex-col gap-4 relative overflow-hidden"
            style={{ padding: "1.5rem" }}
          >

            {/* Header: label + confidence */}
            <div
              className="flex justify-between items-start border-b pb-6"
              style={{ borderColor: "rgba(160, 196, 216, 0.2)" }}
            >
              <div>
                <p
                  className="text-label-caps uppercase tracking-widest mb-2"
                  style={{ color: "rgba(160, 196, 216, 0.7)" }}
                >
                  Analysis Result
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    fontSize: "clamp(32px, 3.5vw, 48px)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "#FFFFFF",
                  }}
                >
                  {result.label_vi}
                </h2>
                <p
                  className="text-body-md mt-2"
                  style={{ color: "#bacac6", maxWidth: 320 }}
                >
                  {config.description}
                </p>
              </div>

              {/* Confidence badge */}
              <div className="text-right flex flex-col items-end flex-shrink-0 ml-4">
                <p
                  className="text-label-caps uppercase tracking-widest mb-2"
                  style={{ color: "rgba(160, 196, 216, 0.7)" }}
                >
                  Confidence
                </p>
                <div
                  className="px-4 py-2 rounded border"
                  style={{
                    background: "rgba(0, 200, 180, 0.1)",
                    borderColor: "rgba(0, 200, 180, 0.3)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      fontSize: 32,
                      color: "#00C8B4",
                      fontWeight: 500,
                    }}
                  >
                    {confidencePct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Freshness index bars */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <p
                  className="text-label-caps uppercase"
                  style={{ color: "rgba(160, 196, 216, 0.7)" }}
                >
                  Freshness Index
                </p>
                <span
                  className="text-data-mono"
                  style={{ color: "#dee3ea" }}
                >
                  Grade {config.grade} — {result.label}
                </span>
              </div>

              {/* 3 horizontal bars (worst → best: left to right) */}
              <div className="flex gap-2 w-full h-3">
                {GRADE_ORDER.slice()
                  .reverse()
                  .map((g, idx) => {
                    /* Active when this bar's grade ≤ selected grade */
                    const isActive = g.grade <= config.grade;
                    return (
                      <div
                        key={g.label}
                        className="flex-1 rounded-full border"
                        style={{
                          background: isActive ? config.color : "#252a30",
                          borderColor: isActive
                            ? `${config.color}80`
                            : "rgba(160, 196, 216, 0.1)",
                          boxShadow: isActive
                            ? `0 0 10px ${config.color}50`
                            : "none",
                          transition: `all 0.4s ease ${idx * 0.08}s`,
                        }}
                      />
                    );
                  })}
              </div>

              <div
                className="flex justify-between mt-2 text-data-mono"
                style={{ fontSize: 10, color: "rgba(160, 196, 216, 0.5)" }}
              >
                <span>1 – Not Fresh</span>
                <span>3 – Highly Fresh</span>
              </div>
            </div>

            {/* Probability distribution bar chart */}
            <div>
              <p
                className="text-label-caps uppercase mb-6"
                style={{ color: "rgba(160, 196, 216, 0.7)" }}
              >
                Probability Distribution
              </p>

              <div
                className="flex items-end gap-4 h-28 w-full border-b border-l pb-2 pl-2"
                style={{ borderColor: "rgba(160, 196, 216, 0.2)" }}
              >
                {probBars.map((g) => {
                  const isActive = g.label === result.label;
                  const heightPct = Math.max(g.prob * 100, 2); // min 2% for visibility
                  return (
                    <div
                      key={g.label}
                      className="flex-1 flex flex-col justify-end items-center"
                    >
                      <div
                        className="w-full transition-all duration-500 relative overflow-hidden"
                        style={{
                          height: `${heightPct}%`,
                          background: isActive ? "#00C8B4" : "#252a30",
                          border: isActive
                            ? "none"
                            : "1px solid rgba(160, 196, 216, 0.1)",
                          boxShadow: isActive
                            ? "0 0 15px rgba(0, 200, 180, 0.3)"
                            : "none",
                        }}
                      >
                        {isActive && (
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, transparent, rgba(255,255,255,0.15))",
                            }}
                          />
                        )}
                      </div>
                      <span
                        className="text-data-mono mt-2"
                        style={{
                          fontSize: 10,
                          color: isActive ? "#00C8B4" : "rgba(160, 196, 216, 0.6)",
                          fontWeight: isActive ? 700 : 400,
                        }}
                      >
                        G{g.grade}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-2">
              <button
                id="save-record-button"
                className="flex-1 py-3 rounded text-label-caps uppercase tracking-widest border transition-colors duration-300"
                style={{
                  background: "#00C8B4",
                  color: "#003731",
                  borderColor: "#00C8B4",
                }}
                onClick={() => {
                  /* Triggers browser print dialog as a simple "save" action */
                  window.print();
                }}
              >
                Save Record
              </button>

              <button
                id="new-scan-button"
                className="flex-1 py-3 rounded text-label-caps uppercase tracking-widest border transition-colors duration-300"
                style={{
                  background: "transparent",
                  color: "#00C8B4",
                  borderColor: "rgba(160, 196, 216, 0.3)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "transparent")
                }
                onClick={onNewScan}
                aria-label="Start a new scan"
              >
                New Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
