import { useEffect } from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";

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

  const Icon = isSuccess ? Check : isError ? AlertTriangle : Info;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_22px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-[lux-fade-up_0.35s_cubic-bezier(0.22,1,0.36,1)_both] ${
          isSuccess
            ? "border-emerald-300/22 bg-emerald-500/[0.10] text-emerald-50"
            : isError
            ? "border-rose-300/22 bg-rose-500/[0.10] text-rose-50"
            : "border-white/10 bg-[rgba(8,14,26,0.92)] text-white"
        }`}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-emerald-400/15 text-emerald-200"
              : isError
              ? "bg-rose-400/15 text-rose-200"
              : "bg-amber-300/12 text-amber-200"
          }`}
        >
          <Icon size={15} strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold tracking-tight">
            {toast.title ||
              (isSuccess ? "Success" : isError ? "Something went wrong" : "Notice")}
          </p>
          {toast.message && (
            <p className="mt-1 text-[13px] leading-snug opacity-85">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="-m-1 rounded-lg p-1.5 text-current/70 transition hover:bg-white/10"
          aria-label="Close notification"
        >
          <X size={14} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
