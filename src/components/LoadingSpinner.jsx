function LoadingSpinner({ label }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-10"
      role="status"
      aria-live="polite"
    >
      <div className="lux-spinner" aria-hidden="true" />
      {label ? (
        <p className="lux-eyebrow text-[10px] text-amber-300/70">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}

export default LoadingSpinner;
