"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"

interface UseCarouselProps {
  totalItems: number
  itemsPerPage: number
  autoPlay?: boolean
  autoPlayInterval?: number
}

interface UseCarouselReturn {
  currentPage: number
  totalPages: number
  canGoNext: boolean
  canGoPrev: boolean
  goToNext: () => void
  goToPrev: () => void
  goToPage: (page: number) => void
  containerRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
  dragOffset: number
}

export function useCarousel({
  totalItems,
  itemsPerPage,
}: UseCarouselProps): UseCarouselReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - containerRef.current.offsetLeft
    scrollLeft.current = containerRef.current.scrollLeft
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return
      e.preventDefault()
      const x = e.pageX - containerRef.current.offsetLeft
      const walk = (x - startX.current) * 2 // Multiplicador para acelerar el scroll
      containerRef.current.scrollLeft = scrollLeft.current - walk
    },
    [isDragging],
  )

  // No se necesitan los cálculos de página ni navegación, se elimina esa lógica.
  // El componente ahora es mucho más simple.

  return {
    // Valores de retorno simplificados
    currentPage: 0,
    totalPages: 1,
    canGoNext: false,
    canGoPrev: false,
    goToNext: () => {},
    goToPrev: () => {},
    goToPage: () => {},
    containerRef,
    isDragging,
    dragOffset: 0, // No se usa, pero se mantiene por la interfaz
    // Adjuntar eventos directamente en el JSX del componente que usa el hook
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
  }
}
