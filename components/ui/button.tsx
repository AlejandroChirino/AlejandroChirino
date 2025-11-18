import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@/lib/types"

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", loading = false, disabled, className, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors transition-shadow shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-green)]",
          "disabled:cursor-not-allowed disabled:shadow-none",

          // Variant styles
          {
            // Botón primario: verde de marca sólido, estados sin alterar el tono base
            "bg-[var(--brand-green)] text-[var(--brand-on-green)] hover:shadow-md hover:brightness-105 active:shadow-sm active:brightness-105":
              variant === "primary",
            // Secundario: también usa el verde de marca para mantener coherencia
            "bg-[var(--brand-green)] text-[var(--brand-on-green)] hover:shadow-md hover:brightness-105 active:shadow-sm":
              variant === "secondary",
            // Outline: borde y texto en verde, sin fondo; hover con leve tinte (sin tocar el tono base)
            "border border-[var(--brand-green)] text-[var(--brand-green)] bg-transparent hover:bg-[rgba(0,200,83,0.08)] active:bg-[rgba(0,200,83,0.12)]":
              variant === "outline",
          },

          // Size styles
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },

          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
