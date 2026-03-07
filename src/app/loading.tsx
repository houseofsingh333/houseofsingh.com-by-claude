export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
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
      `}</style>
    </div>
  );
}
