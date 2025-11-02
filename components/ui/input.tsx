import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils"
import type { InputProps } from "@/lib/types"

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, label, id, ...props }, ref) => {
  // useId garantiza estabilidad entre SSR y cliente, evitando hydration mismatches
  const reactId = useId()
  const inputId = id || reactId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full px-3 py-2 border rounded-lg transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          "disabled:bg-gray-50 disabled:cursor-not-allowed",
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-accent-orange focus:border-accent-orange",
          className,
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = "Input"

export default Input
