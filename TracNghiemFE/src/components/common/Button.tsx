import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
}

export function Button({ children, variant = "primary", size = "md", disabled = false, loading = false, type = "button", className = "", onClick }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900",
    secondary: "bg-white text-black border border-black hover:bg-neutral-100 active:bg-neutral-200",
    ghost: "bg-transparent text-black hover:bg-neutral-100 active:bg-neutral-200",
    danger: "bg-white text-red-600 border border-red-600 hover:bg-red-50 active:bg-red-100"
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm rounded",
    md: "h-10 px-4 text-sm rounded-md",
    lg: "h-12 px-6 text-base rounded-md"
  };

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
