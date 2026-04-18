import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> {
  label?: string;
  id: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export function Select({ label, id, options, placeholder = "-- Chọn --", error, disabled = false, required = false, className = "", ...rest }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700 select-none">
          {label}
          {required && <span className="ml-1 text-black">*</span>}
        </label>
      )}
      <select
        id={id}
        disabled={disabled}
        required={required}
        className={`h-10 px-3 text-sm border rounded-md bg-white text-black
          transition-colors duration-150 outline-none appearance-none
          focus:border-black focus:ring-1 focus:ring-black
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-neutral-300"}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
