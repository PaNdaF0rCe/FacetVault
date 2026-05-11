import { AlertTriangle } from "lucide-react";

function ErrorAlert({ message, title = "Something went wrong" }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-500/[0.06] px-4 py-3 backdrop-blur"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rose-300/25 bg-rose-300/10 text-rose-200">
        <AlertTriangle size={14} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-rose-100">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-rose-200/85">
          {message}
        </p>
      </div>
    </div>
  );
}

export default ErrorAlert;
