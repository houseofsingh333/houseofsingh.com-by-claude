export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin motion-reduce:animate-none" />
    </div>
  );
}
