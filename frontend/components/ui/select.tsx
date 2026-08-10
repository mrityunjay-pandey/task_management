import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

// A native <select> rather than a custom-built dropdown: it's fully
// keyboard/screen-reader accessible for free, works on mobile without
// extra handling, and doesn't need a click-outside-to-close implementation.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={`h-10 rounded-lg border bg-card px-3 text-sm text-card-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${error ? "border-destructive" : "border-input-border"} ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  },
);
Select.displayName = "Select";
