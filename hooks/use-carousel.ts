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
  autoPlay = false,
  autoPlayInterval = 5000,
}: UseCarouselProps): UseCarouselReturn {
  const [currentPage, setCurrentPage] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  // Calcular páginas totales
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  // Verificar si se puede navegar
  const canGoNext = currentPage < totalPages - 1
  const canGoPrev = currentPage > 0

  // Navegación
  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [canGoNext])

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [canGoPrev])

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page)
      }
    },
    [totalPages],
  )

  // Auto-play
  useEffect(() => {
    if (autoPlay && totalPages > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages)
      }, autoPlayInterval)

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }
  }, [autoPlay, autoPlayInterval, totalPages])

  // Touch/Mouse events
  const handleStart = useCallback(
    (clientX: number) => {
      setIsDragging(true)
      startX.current = clientX
      scrollLeft.current = currentPage
      setDragOffset(0)

      // Pausar auto-play durante drag
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    },
    [currentPage],
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current) return

      const x = clientX - startX.current
      const containerWidth = containerRef.current.offsetWidth
      const threshold = containerWidth * 0.2 // 20% del ancho para cambiar página

      setDragOffset(x)

      // Cambiar página si el drag supera el threshold
      if (Math.abs(x) > threshold) {
        if (x > 0 && canGoPrev) {
          goToPrev()
          setIsDragging(false)
          setDragOffset(0)
        } else if (x < 0 && canGoNext) {
          goToNext()
          setIsDragging(false)
          setDragOffset(0)
        }
      }
    },
    [isDragging, canGoNext, canGoPrev, goToNext, goToPrev],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setDragOffset(0)

    // Reanudar auto-play
    if (autoPlay && totalPages > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages)
      }, autoPlayInterval)
    }
  }, [autoPlay, autoPlayInterval, totalPages])

  // Event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      // Do not call preventDefault here to allow child links/buttons to receive taps
      handleStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Avoid preventing default to keep native scrolling/click behavior; movement handling
      // is managed in handleMove which updates internal drag state and pages.
      handleMove(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
      handleEnd()
    }

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX)
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX)
    }

    const handleMouseUp = () => {
      handleEnd()
    }

    // Add event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)
    container.addEventListener("mousedown", handleMouseDown)

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleStart, handleMove, handleEnd])

  return {
    currentPage,
    totalPages,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    goToPage,
    containerRef,
    isDragging,
    dragOffset,
  }
}
