/* ScanningState — State 2: Loading animation while model processes image */
"use client";

interface ScanningStateProps {
  previewUrl: string | null;
}

export default function ScanningState({ previewUrl }: ScanningStateProps) {
  return (
    <main
      className="flex flex-1 flex-col items-center justify-center w-full max-w-3xl mx-auto text-center gap-4"
      style={{
        paddingTop: "1rem",
        paddingBottom: "1rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      {/* Hero text — same as UploadState */}
      <div className="space-y-4">
        <h1
          className="text-surface-white drop-shadow-lg"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Phân tích độ tươi mắt cá tức thì
        </h1>
        <p
          className="text-body-lg max-w-2xl mx-auto"
          style={{ color: "rgba(160, 196, 216, 0.8)" }}
        >
          Powered by Swin Transformer · Upload a photo, get results in seconds
        </p>
      </div>

      {/* Upload zone — disabled, shows image with scan line animation */}
      <div
        className="glass-panel w-full flex flex-col items-center justify-center rounded-xl border-2 relative overflow-hidden"
        style={{
          maxWidth: 480,
          height: "clamp(120px, 15dvh, 150px)",
          borderColor: "rgba(0, 200, 180, 0.6)",
          borderStyle: "solid",
        }}
        aria-label="Analyzing image"
        aria-busy="true"
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Analyzing"
              className="w-full h-full object-cover absolute inset-0 opacity-50"
            />
            {/* Scan line animation */}
            <div className="animate-scan" aria-hidden="true" />
            {/* Overlay text */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: "#00C8B4", fontVariationSettings: "'FILL' 0" }}
              >
                radar
              </span>
              <span
                className="text-label-caps uppercase tracking-widest"
                style={{ color: "#00C8B4" }}
              >
                Scanning…
              </span>
            </div>
          </>
        ) : (
          /* Fallback if no preview URL */
          <div className="flex flex-col items-center gap-3">
            <span
              className="material-symbols-outlined text-5xl"
              style={{ color: "#00C8B4", fontVariationSettings: "'FILL' 0" }}
            >
              radar
            </span>
            <span
              className="text-label-caps"
              style={{ color: "rgba(160, 196, 216, 0.8)" }}
            >
              Processing image…
            </span>
          </div>
        )}
      </div>

      {/* Cold start warning */}
      <p
        className="text-label-caps max-w-sm text-center"
        style={{ color: "rgba(160, 196, 216, 0.6)" }}
        aria-live="polite"
      >
        Đang khởi động model, lần đầu có thể mất 30s…
      </p>

      {/* Analyzing button — disabled with spinner */}
      <button
        disabled
        className="flex items-center gap-3 px-10 py-4 rounded-lg text-label-caps uppercase tracking-widest cursor-not-allowed"
        style={{
          background: "rgba(0, 200, 180, 0.15)",
          color: "rgba(0, 200, 180, 0.6)",
          border: "1px solid rgba(0, 200, 180, 0.3)",
        }}
        aria-label="Analyzing in progress"
      >
        {/* CSS spinner */}
        <span
          className="animate-spin-slow"
          style={{
            display: "inline-block",
            width: 20,
            height: 20,
            border: "2px solid rgba(0, 200, 180, 0.3)",
            borderTopColor: "#00C8B4",
            borderRadius: "50%",
          }}
          aria-hidden="true"
        />
        Analyzing…
      </button>

      {/* Progress dots */}
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: "#00C8B4",
              animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </main>
  );
}
