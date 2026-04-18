import type { ReactNode } from "react";

type BadgeVariant = "default" | "black" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-neutral-100 text-neutral-700",
    black: "bg-black text-white",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    danger: "bg-red-50 text-red-600 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200"
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}
