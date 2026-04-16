import type { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  label?: string;
  id: string;
  error?: string;
  className?: string;
}

export function Input({ label, id, type = "text", error, disabled = false, required = false, className = "", ...rest }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700 select-none">
          {label}
          {required && <span className="ml-1 text-black">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        className={`h-10 px-3 text-sm border rounded-md bg-white text-black placeholder-neutral-400
          transition-colors duration-150 outline-none
          focus:border-black focus:ring-1 focus:ring-black
          disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-neutral-300"}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
