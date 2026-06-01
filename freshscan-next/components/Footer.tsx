/* Footer — fixed bottom bar with tech stack label */
"use client";

export default function Footer() {
  return (
    <footer
      className="sticky bottom-0 left-0 right-0 z-50 flex justify-center items-center py-3 px-6 border-t mt-auto"
      style={{ borderColor: "rgba(160, 196, 216, 0.1)" }}
    >
      <p
        className="text-label-caps uppercase tracking-widest text-center"
        style={{ color: "rgba(160, 196, 216, 0.5)" }}
      >
        Swin Transformer · Conditional Ordinal Regression · Dual Pooling
      </p>
    </footer>
  );
}
