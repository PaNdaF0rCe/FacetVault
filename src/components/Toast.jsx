import { useEffect } from "react";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur ${
          isSuccess
            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
            : isError
            ? "border-red-400/20 bg-red-500/10 text-red-100"
            : "border-white/10 bg-[#091427]/95 text-white"
        }`}
      >
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isSuccess
              ? "bg-emerald-400/15 text-emerald-300"
              : isError
              ? "bg-red-400/15 text-red-300"
              : "bg-white/10 text-white"
          }`}
        >
          {isSuccess ? "✓" : isError ? "!" : "•"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {toast.title || (isSuccess ? "Success" : isError ? "Something went wrong" : "Notice")}
          </p>
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;