export default function Loading() {
  return (
    <div className="min-h-[100svh] flex items-center justify-center bg-background">
      <img
        src="/images/hos-logo.svg"
        alt="Loading"
        width={120}
        height={120}
        className="animate-pulse-subtle"
        style={{
          width: 120,
          height: "auto",
          opacity: 0.3,
          animation: "pulse-subtle 2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-subtle { animation: none !important; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
