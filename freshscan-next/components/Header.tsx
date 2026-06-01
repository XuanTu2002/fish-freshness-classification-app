/* Header — fixed top bar with FreshScan AI brand + model accuracy badge */
"use client";

export default function Header() {
  return (
    <header className="glass-panel sticky top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-3xl"
          style={{
            color: "#00C8B4",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          biotech
        </span>
        <span
          className="text-headline-md tracking-tight leading-none uppercase"
          style={{ color: "#FFFFFF", fontFamily: "var(--font-playfair, 'Playfair Display', serif)" }}
        >
          FreshScan AI
        </span>
      </div>

      {/* Model accuracy badge */}
      <div className="hidden md:flex items-center">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            background: "rgba(37, 42, 48, 0.8)",
            borderColor: "rgba(0, 200, 180, 0.3)",
          }}
        >
          {/* Pulse dot */}
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#00C8B4",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            className="text-label-caps uppercase tracking-wider"
            style={{ color: "#00C8B4" }}
          >
            Model accuracy: 90.97%
          </span>
        </div>
      </div>
    </header>
  );
}
