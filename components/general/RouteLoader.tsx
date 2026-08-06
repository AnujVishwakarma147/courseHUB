export function RouteLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        className="size-20 animate-spin rounded-full border-[6px] border-muted border-t-primary motion-reduce:animate-pulse sm:size-24"
        aria-hidden="true"
      />

      <span className="sr-only">Loading...</span>
    </div>
  );
}
