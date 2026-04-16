import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> {
  label?: string;
  id: string;
  error?: string;
  className?: string;
}

export function Textarea({ label, id, rows = 4, error, disabled = false, required = false, className = "", ...rest }: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700 select-none">
          {label}
          {required && <span className="ml-1 text-black">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`px-3 py-2 text-sm border rounded-md bg-white text-black placeholder-neutral-400
          resize-y transition-colors duration-150 outline-none
          focus:border-black focus:ring-1 focus:ring-black
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-neutral-300"}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
