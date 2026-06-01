/* UploadState — State 1: Landing page with drag-and-drop upload zone */
"use client";

import { useCallback, useRef, useState } from "react";

interface UploadStateProps {
  onAnalyze: (file: File) => void;
  error?: string | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function UploadState({ onAnalyze, error }: UploadStateProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Validates file type and size */
  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "Only JPEG, PNG, and WebP images are accepted.";
    }
    if (f.size > MAX_SIZE_BYTES) {
      return "File size must be under 10 MB.";
    }
    return null;
  };

  /* Handles a file selection from either input or drop */
  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  /* Drag-and-drop handlers */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  /* File input change handler */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  /* Triggers the hidden file input */
  const handleZoneClick = () => inputRef.current?.click();

  /* Submits to parent handler */
  const handleAnalyzeClick = () => {
    if (file) onAnalyze(file);
  };

  const displayError = error || validationError;

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
      {/* Hero text */}
      <div className="space-y-2 animate-fade-in-up">
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
          className="text-body-md max-w-2xl mx-auto"
          style={{ color: "rgba(160, 196, 216, 0.8)" }}
        >
          Powered by Swin Transformer · Upload a photo, get results in seconds
        </p>
      </div>

      {/* Upload zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload fish eye image"
        onClick={handleZoneClick}
        onKeyDown={(e) => e.key === "Enter" && handleZoneClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`upload-zone glass-panel w-full cursor-pointer flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed relative overflow-hidden ${
          isDragOver ? "drag-over" : ""
        }`}
        style={{
          maxWidth: 480,
          height: "clamp(120px, 15dvh, 150px)",
          borderColor: isDragOver ? "#00C8B4" : "rgba(0, 200, 180, 0.5)",
        }}
      >
        {previewUrl ? (
          /* Preview thumbnail when file is selected */
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover absolute inset-0 opacity-60"
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: "#00C8B4", fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span
                className="text-label-caps text-surface-white px-2 text-center break-all"
                style={{ maxWidth: 400 }}
              >
                {file?.name}
              </span>
              <span
                className="text-label-caps"
                style={{ color: "rgba(160, 196, 216, 0.7)" }}
              >
                Click to change image
              </span>
            </div>
          </>
        ) : (
          /* Default empty state */
          <>
            <span
              className="material-symbols-outlined text-5xl transition-colors"
              style={{
                color: isDragOver ? "#00C8B4" : "rgba(0, 200, 180, 0.7)",
                fontVariationSettings: "'FILL' 0",
              }}
            >
              add_a_photo
            </span>
            <span
              className="text-label-caps transition-colors"
              style={{ color: isDragOver ? "#FFFFFF" : "#A0C4D8" }}
            >
              Drop fish eye image here, or click to upload
            </span>
            <span
              className="text-label-caps"
              style={{ color: "rgba(160, 196, 216, 0.4)" }}
            >
              JPEG · PNG · WebP · max 10 MB
            </span>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {/* Error message */}
      {displayError && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm"
          style={{
            background: "rgba(147, 0, 10, 0.2)",
            borderColor: "rgba(255, 180, 171, 0.3)",
            color: "#ffb4ab",
          }}
        >
          <span className="material-symbols-outlined text-base">error</span>
          <span className="text-label-caps">{displayError}</span>
        </div>
      )}

      {/* Analyze button */}
      <button
        id="analyze-button"
        onClick={handleAnalyzeClick}
        disabled={!file}
        className="flex items-center gap-3 px-10 py-4 rounded-lg text-label-caps uppercase tracking-widest transition-all duration-300"
        style={{
          background: file ? "#00C8B4" : "rgba(0, 200, 180, 0.2)",
          color: file ? "#003731" : "rgba(0, 200, 180, 0.4)",
          cursor: file ? "pointer" : "not-allowed",
          border: file ? "1px solid #00C8B4" : "1px solid rgba(0, 200, 180, 0.2)",
        }}
        aria-disabled={!file}
      >
        <span className="material-symbols-outlined">analytics</span>
        Analyze Now
      </button>
    </main>
  );
}
