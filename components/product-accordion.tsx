"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

interface ProductAccordionProps {
  items: AccordionItem[]
  className?: string
}

export default function ProductAccordion({ items, className = "" }: ProductAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id)

        return (
          <div key={item.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <span className="font-medium text-gray-900">{item.title}</span>
              <ChevronDown className={cn("h-5 w-5 text-gray-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            <div
              id={`accordion-content-${item.id}`}
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <div className="p-4 pt-0 text-gray-600 text-sm">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
