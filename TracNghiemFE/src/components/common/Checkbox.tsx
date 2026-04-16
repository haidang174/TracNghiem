interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({ label, checked, onChange, disabled = false, id }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-neutral-300 text-black
          focus:ring-black focus:ring-1 accent-black disabled:cursor-not-allowed"
      />
      {label && <span className="text-sm text-neutral-700 group-hover:text-black transition-colors">{label}</span>}
    </label>
  );
}
