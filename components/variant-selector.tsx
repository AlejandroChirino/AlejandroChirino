"use client"

import { cn } from "@/lib/utils"

interface VariantSelectorProps {
  sizes: string[]
  colors: string[]
  selectedSize: string | null
  selectedColor: string | null
  onSizeChange: (size: string) => void
  onColorChange: (color: string) => void
  availableStock: number
  className?: string
}

export default function VariantSelector({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  availableStock,
  className = "",
}: VariantSelectorProps) {
  const isSizeAvailable = (size: string) => {
    return availableStock > 0
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Talla
            {selectedSize && <span className="ml-2 text-gray-500">({selectedSize})</span>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isAvailable = isSizeAvailable(size)
              const isSelected = selectedSize === size

              return (
                <button
                  key={size}
                  onClick={() => isAvailable && onSizeChange(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-w-[44px] h-11 px-3 border rounded-lg text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2",
                    {
                      "border-accent-orange bg-accent-orange text-white": isSelected && isAvailable,
                      "border-gray-300 bg-white text-gray-900 hover:border-gray-400": !isSelected && isAvailable,
                      "border-gray-200 bg-gray-50 text-gray-400 line-through cursor-not-allowed": !isAvailable,
                    },
                  )}
                  aria-label={`Talla ${size}${!isAvailable ? " - No disponible" : ""}`}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Color
            {selectedColor && <span className="ml-2 text-gray-500">({selectedColor})</span>}
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedColor === color

              return (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2",
                    {
                      "border-accent-orange ring-2 ring-accent-orange ring-offset-2": isSelected,
                      "border-gray-300 hover:border-gray-400": !isSelected,
                    },
                  )}
                  style={{
                    backgroundColor: color.toLowerCase().includes("#") ? color : getColorValue(color),
                  }}
                  aria-label={`Color ${color}`}
                  aria-pressed={isSelected}
                  title={color}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to convert color names to hex values
function getColorValue(colorName: string): string {
  const colorMap: Record<string, string> = {
    negro: "#000000",
    blanco: "#FFFFFF",
    rojo: "#DC2626",
    azul: "#2563EB",
    verde: "#16A34A",
    amarillo: "#EAB308",
    rosa: "#EC4899",
    gris: "#6B7280",
    marrón: "#92400E",
    naranja: "#EA580C",
  }

  return colorMap[colorName.toLowerCase()] || "#6B7280"
}
