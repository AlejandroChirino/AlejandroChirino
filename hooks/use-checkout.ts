"use client"

import { useState, useCallback, useMemo } from "react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"
import type {
  CustomerData,
  DeliveryMethod,
  PaymentMethod,
  CheckoutCalculations,
  DeliveryInfo,
  PaymentInfo,
  UseCheckoutReturn,
} from "@/lib/types"

const DELIVERY_COSTS = {
  tienda: 0,
  local: 250,
  municipal: 500,
}

const FREE_DELIVERY_THRESHOLDS = {
  local: 5000,
  municipal: 20000,
}

const PAYMENT_DISCOUNTS = {
  efectivo_cup: 0.05, // 5% descuento
}

export function useCheckout(): UseCheckoutReturn {
  const { items, subtotal } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  })
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod | null>(null)
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod | null>(null)

  // Calcular información de entrega
  const deliveryInfo = useMemo((): DeliveryInfo | null => {
    if (!deliveryMethod) return null

    const baseCost = DELIVERY_COSTS[deliveryMethod]
    let isFree = baseCost === 0

    // Verificar si califica para envío gratis
    if (deliveryMethod === "local" && subtotal >= FREE_DELIVERY_THRESHOLDS.local) {
      isFree = true
    } else if (deliveryMethod === "municipal" && subtotal >= FREE_DELIVERY_THRESHOLDS.municipal) {
      isFree = true
    }

    const descriptions = {
      tienda: "Recogida en tienda - Gratis",
      local: isFree
        ? `Entrega local - Gratis (pedido >$${FREE_DELIVERY_THRESHOLDS.local} CUP)`
        : `Entrega local - $${baseCost} CUP`,
      municipal: isFree
        ? `Entrega municipal - Gratis (pedido >$${FREE_DELIVERY_THRESHOLDS.municipal} CUP)`
        : `Entrega municipal - $${baseCost} CUP`,
    }

    return {
      method: deliveryMethod,
      cost: isFree ? 0 : baseCost,
      isFree,
      description: descriptions[deliveryMethod],
    }
  }, [deliveryMethod, subtotal])

  // Calcular información de pago
  const paymentInfo = useMemo((): PaymentInfo | null => {
    if (!paymentMethod) return null

    const discount = PAYMENT_DISCOUNTS[paymentMethod as keyof typeof PAYMENT_DISCOUNTS] || 0

    const descriptions = {
      transferencia: "Transferencia bancaria",
      efectivo_cup: `Efectivo CUP - 5% descuento aplicado`,
      efectivo_usd: "Efectivo USD",
      zelle: "Zelle (USD)",
    }

    return {
      method: paymentMethod,
      discount,
      description: descriptions[paymentMethod],
    }
  }, [paymentMethod])

  // Calcular totales
  const calculations = useMemo((): CheckoutCalculations => {
    const deliveryCost = deliveryInfo?.cost || 0
    const discountRate = paymentInfo?.discount || 0
    const discount = subtotal * discountRate
    const total = subtotal - discount + deliveryCost

    // Determinar moneda basada en método de pago
    const currency = paymentMethod === "zelle" || paymentMethod === "efectivo_usd" ? "USD" : "CUP"

    return {
      subtotal,
      deliveryCost,
      discount,
      total,
      currency,
    }
  }, [subtotal, deliveryInfo, paymentInfo, paymentMethod])

  // Validar si el checkout está completo
  const isValid = useMemo(() => {
    const isCustomerValid = customerData.fullName && customerData.phone && customerData.address
    return !!(isCustomerValid && deliveryMethod && paymentMethod && items.length > 0)
  }, [customerData, deliveryMethod, paymentMethod, items])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step)
    }
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const updateCustomerData = useCallback((data: Partial<CustomerData>) => {
    setCustomerData((prev) => ({ ...prev, ...data }))
  }, [])

  const setDeliveryMethod = useCallback((method: DeliveryMethod) => {
    setDeliveryMethodState(method)
  }, [])

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethodState(method)
  }, [])

  const submitOrder = useCallback(async (): Promise<boolean> => {
    if (!isValid) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return false
    }

    try {
      // Generar mensaje para WhatsApp
      const orderSummary = generateWhatsAppMessage({
        customer: customerData,
        delivery: deliveryInfo!,
        payment: paymentInfo!,
        calculations,
        items,
      })

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/5352434599?text=${encodeURIComponent(orderSummary)}`
      window.open(whatsappUrl, "_blank")

      toast({
        title: "Pedido enviado",
        description: "Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto.",
      })

      return true
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el pedido. Inténtalo de nuevo.",
        variant: "destructive",
      })
      return false
    }
  }, [isValid, customerData, deliveryInfo, paymentInfo, calculations, items])

  return {
    currentStep,
    customerData,
    deliveryMethod,
    paymentMethod,
    calculations,
    isValid,
    goToStep,
    nextStep,
    prevStep,
    updateCustomerData,
    setDeliveryMethod,
    setPaymentMethod,
    submitOrder,
  }
}

// Función para generar el mensaje de WhatsApp
function generateWhatsAppMessage(data: any): string {
  const { customer, delivery, payment, calculations, items } = data

  let message = `🛍️ *NUEVO PEDIDO - LA L FASHION*\n\n`

  // Datos del cliente
  message += `👤 *DATOS DEL CLIENTE*\n`
  message += `Nombre: ${customer.fullName}\n`
  message += `Teléfono: ${customer.phone}\n`
  message += `Email: ${customer.email}\n`
  message += `Dirección: ${customer.address}\n`
  message += `Ciudad: ${customer.city}\n`
  if (customer.notes) {
    message += `Notas: ${customer.notes}\n`
  }
  message += `\n`

  // Productos
  message += `📦 *PRODUCTOS*\n`
  items.forEach((item: any, index: number) => {
    message += `${index + 1}. ${item.product.name}\n`
    if (item.size) message += `   Talla: ${item.size}\n`
    if (item.color) message += `   Color: ${item.color}\n`
    message += `   Cantidad: ${item.quantity}\n`
    message += `   Precio: $${item.product.price} ${calculations.currency}\n\n`
  })

  // Entrega
  message += `🚚 *MÉTODO DE ENTREGA*\n`
  message += `${delivery.description}\n\n`

  // Pago
  message += `💳 *MÉTODO DE PAGO*\n`
  message += `${payment.description}\n\n`

  // Totales
  message += `💰 *RESUMEN DE COSTOS*\n`
  message += `Subtotal: $${calculations.subtotal.toFixed(2)} ${calculations.currency}\n`
  if (calculations.deliveryCost > 0) {
    message += `Envío: $${calculations.deliveryCost.toFixed(2)} ${calculations.currency}\n`
  }
  if (calculations.discount > 0) {
    message += `Descuento: -$${calculations.discount.toFixed(2)} ${calculations.currency}\n`
  }
  message += `*TOTAL: $${calculations.total.toFixed(2)} ${calculations.currency}*\n\n`

  message += `📅 Fecha: ${new Date().toLocaleDateString("es-ES")}\n`
  message += `⏰ Hora: ${new Date().toLocaleTimeString("es-ES")}`

  return message
}
