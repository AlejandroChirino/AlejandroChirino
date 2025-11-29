"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { safeSupabase } from "@/lib/supabaseClient"
import type {
  CustomerData,
  DeliveryMethod,
  PaymentMethod,
  CheckoutCalculations,
  DeliveryInfo,
  PaymentInfo,
  UseCheckoutReturn,
} from "@/lib/types"

const DELIVERY_COSTS = { tienda: 0, local: 250, municipal: 500 }
const FREE_DELIVERY_THRESHOLDS = { local: 5000, municipal: 20000 }
const PAYMENT_DISCOUNTS = { efectivo_cup: 0.05 }

const DefaultCustomer: CustomerData = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
}

const CheckoutContext = createContext<UseCheckoutReturn | null>(null)

export function useCheckoutContext() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider")
  return ctx
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { items, subtotal } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData>(DefaultCustomer)
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod | null>(null)
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null)
  const providerIdRef = React.useRef<string>(Math.random().toString(36).slice(2))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // mounted
    try {
      localStorage.getItem('laf_customerData')
      localStorage.getItem('laf_appliedCoupon')
    } catch (e) {
      /* ignore */
    }
    return () => {
      // unmounted
    }
  }, [])

  const deliveryInfo = useMemo((): DeliveryInfo | null => {
    if (!deliveryMethod) return null
    const baseCost = DELIVERY_COSTS[deliveryMethod]
    let isFree = baseCost === 0
    if (deliveryMethod === "local" && subtotal >= FREE_DELIVERY_THRESHOLDS.local) isFree = true
    if (deliveryMethod === "municipal" && subtotal >= FREE_DELIVERY_THRESHOLDS.municipal) isFree = true
    const descriptions: Record<string, string> = {
      tienda: "Recogida en tienda - Gratis",
      local: isFree
        ? `Entrega local - Gratis (pedido >$${FREE_DELIVERY_THRESHOLDS.local} CUP)`
        : `Entrega local - $${baseCost} CUP`,
      municipal: isFree
        ? `Entrega municipal - Gratis (pedido >$${FREE_DELIVERY_THRESHOLDS.municipal} CUP)`
        : `Entrega municipal - $${baseCost} CUP`,
    }

    return { method: deliveryMethod, cost: isFree ? 0 : baseCost, isFree, description: descriptions[deliveryMethod] }
  }, [deliveryMethod, subtotal])

  const paymentInfo = useMemo((): PaymentInfo | null => {
    if (!paymentMethod) return null
    const discount = PAYMENT_DISCOUNTS[paymentMethod as keyof typeof PAYMENT_DISCOUNTS] || 0
    const descriptions: Record<string, string> = {
      transferencia: "Transferencia bancaria",
      efectivo_cup: `Efectivo CUP - 5% descuento aplicado`,
      efectivo_usd: "Efectivo USD",
      zelle: "Zelle (USD)",
    }
    return { method: paymentMethod, discount, description: descriptions[paymentMethod] }
  }, [paymentMethod])

  const calculations = useMemo((): CheckoutCalculations => {
    const deliveryCost = deliveryInfo?.cost || 0
    const discountRate = paymentInfo?.discount || 0

    // 1) descuento por método de pago (porcentaje sobre subtotal)
    const paymentDiscount = subtotal * discountRate

    // 2) descuento por cupón: preferir el monto ya calculado por el servidor (discountAmount).
    // Si no existe, calcular localmente usando appliedCoupon.applicableProducts (si aplica)
    let couponDiscount = 0
    // subtotal de items aplicables al cupón (por defecto todo el subtotal)
    let subtotalApplicable = subtotal
    try {
      if (appliedCoupon) {
        if (Array.isArray(appliedCoupon.applicableProducts) && appliedCoupon.applicableProducts.length > 0) {
          subtotalApplicable = 0
          for (const it of items) {
            if (appliedCoupon.applicableProducts.includes(it.product.id)) {
              subtotalApplicable += Number(it.product.price) * Number(it.quantity || 1)
            }
          }
        }

        if (typeof appliedCoupon.discountAmount === "number" && !Number.isNaN(Number(appliedCoupon.discountAmount))) {
          couponDiscount = Number(appliedCoupon.discountAmount)
        } else {
          if (appliedCoupon.type === "percent" && appliedCoupon.amount) {
            couponDiscount = subtotalApplicable * (Number(appliedCoupon.amount) / 100)
          } else if (appliedCoupon.type === "amount" && appliedCoupon.amount) {
            couponDiscount = Math.min(Number(appliedCoupon.amount), subtotalApplicable)
          } else if (appliedCoupon.type === "free_shipping") {
            // Respect user's rule: do not apply coupon discount to shipping when showing discounts.
            // Treat free_shipping as a special flag but do not include deliveryCost in couponDiscount.
            couponDiscount = 0
          }
        }
      }
    } catch (err) {
      console.warn("Error aplicando cupón en cálculos:", err)
      couponDiscount = 0
    }
    // Do not allow couponDiscount to exceed subtotalApplicable (never discount shipping here)
    if (typeof subtotalApplicable === "number") {
      couponDiscount = Math.min(couponDiscount, subtotalApplicable)
    }

    const discount = paymentDiscount + couponDiscount
    const total = Math.max(0, subtotal - discount + deliveryCost)
    const currency = paymentMethod === "zelle" || paymentMethod === "efectivo_usd" ? "USD" : "CUP"
    return { subtotal, deliveryCost, discount, paymentDiscount, couponDiscount, total, currency }
  }, [subtotal, deliveryInfo, paymentInfo, paymentMethod, appliedCoupon])

  const isValid = useMemo(() => {
    const isCustomerValid = customerData.fullName && customerData.phone && customerData.address
    return !!(isCustomerValid && deliveryMethod && paymentMethod && items.length > 0)
  }, [customerData, deliveryMethod, paymentMethod, items])

  const goToStep = useCallback((step: number) => { if (step >= 1 && step <= 4) setCurrentStep(step) }, [])
  const nextStep = useCallback(() => setCurrentStep((s) => Math.min(4, s + 1)), [])
  const prevStep = useCallback(() => setCurrentStep((s) => Math.max(1, s - 1)), [])

  useEffect(() => {
    try { (globalThis as any).__laf_debug_checkout = (globalThis as any).__laf_debug_checkout || {}; (globalThis as any).__laf_debug_checkout.log = (m: any) => {} } catch (e) {}
  }, [])

  // Rehydrate applied coupon from localStorage so it survives reloads
  // Rehydrate state (customer, coupon, and step) in a single effect and mark hydrated
  useEffect(() => {
    try {
      const storedCustomer = localStorage.getItem("laf_customerData")
      const storedCoupon = localStorage.getItem("laf_appliedCoupon")
      const storedStep = localStorage.getItem("laf_currentStep")

      if (storedCustomer) {
        try { setCustomerData(JSON.parse(storedCustomer)) } catch (e) { /* ignore parse errors */ }
      }
      if (storedCoupon) {
        try { setAppliedCoupon(JSON.parse(storedCoupon)) } catch (e) { /* ignore parse errors */ }
      }
      if (storedStep) {
        const n = Number(storedStep)
        if (!Number.isNaN(n)) setCurrentStep(Math.min(4, Math.max(1, n)))
      }
    } catch (e) {
      /* ignore */
    } finally {
      setHydrated(true)
    }
  }, [])

  // Persist customerData whenever it changes
  useEffect(() => {
    try {
      const before = localStorage.getItem("laf_customerData")
      localStorage.setItem("laf_customerData", JSON.stringify(customerData))
    } catch (e) {
      /* ignore */
    }
  }, [customerData])

  // Persist current step so remounts restore the user's progress
  useEffect(() => {
    try {
      localStorage.setItem("laf_currentStep", String(currentStep))
    } catch (e) { }
  }, [currentStep])

  // Ensure appliedCoupon is persisted consistently
  useEffect(() => {
    try {
      if (appliedCoupon) localStorage.setItem("laf_appliedCoupon", JSON.stringify(appliedCoupon))
      else localStorage.removeItem("laf_appliedCoupon")
    } catch (e) { }
  }, [appliedCoupon])

  useEffect(() => {
    // no-op: currentStep changed
  }, [currentStep])

  const updateCustomerData = useCallback((data: Partial<CustomerData>) => setCustomerData((prev) => ({ ...prev, ...data })), [])
  const setDeliveryMethod = useCallback((m: DeliveryMethod) => setDeliveryMethodState(m), [])
  const setPaymentMethod = useCallback((m: PaymentMethod) => setPaymentMethodState(m), [])

  const submitOrder = useCallback(async (): Promise<boolean> => {
    if (!isValid) { toast({ title: "Error", description: "Por favor completa todos los campos requeridos", variant: "destructive" }); return false }
    try {
      const { data: authData } = await safeSupabase.auth.getUser()
      const userId = (authData as any)?.user?.id
      const payload: any = {
        shipping_address: customerData.address,
        items: items.map((it: any) => ({ product_id: it.product.id, quantity: it.quantity || 1, price: it.product.price, size: it.size || null, color: it.color || null })),
        customer: { fullName: customerData.fullName, phone: customerData.phone, email: customerData.email, address: customerData.address, city: customerData.city, notes: customerData.notes },
      }
      if (userId) payload.user_id = userId
      if (appliedCoupon) payload.appliedCoupon = appliedCoupon
      const resp = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); console.warn("Order creation failed:", err); toast({ title: "Error", description: "No se pudo crear la orden. Inténtalo de nuevo.", variant: "destructive" }); return false }
      const body = await resp.json()
      const orderId = body?.id
      const orderSummary = generateWhatsAppMessage({ customer: customerData, delivery: deliveryInfo!, payment: paymentInfo!, calculations, items, orderId })
      const whatsappUrl = `https://wa.me/5352434599?text=${encodeURIComponent(orderSummary)}`
      window.open(whatsappUrl, "_blank")
      toast({ title: "Pedido creado", description: "Tu orden fue creada y se abrió WhatsApp para completarla." })
      return true
    } catch (error) { console.error("Error submitting order:", error); toast({ title: "Error", description: "No se pudo procesar el pedido. Inténtalo de nuevo.", variant: "destructive" }); return false }
  }, [isValid, customerData, deliveryInfo, paymentInfo, calculations, items])

  const applyCoupon = useCallback(async (code: string) => {
    try {
      // DEBUG: log estado actual antes de validar cupón
      // applyCoupon - before

      const payload = { code, items: items.map((it: any) => ({ product: { id: it.product.id, price: it.product.price, category: it.product.category, subcategoria: it.product.subcategoria, tags: (it.product as any).tags || [], brand: (it.product as any).brand || null }, quantity: it.quantity })), subtotal, deliveryCost: deliveryInfo?.cost || 0 }
      const resp = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!resp.ok) {
        console.warn("coupon validate endpoint failed, falling back to local")
        try { const errBody = await resp.json().catch(() => ({})); toast({ title: "Cupón", description: errBody?.reason || "Error validando cupón", variant: "destructive" }) } catch (e) {}
        return { success: false, message: "Error validando cupón" }
      }
      const body = await resp.json()
      // coupon validate response
      if (body.valid) {
        const serverCoupon = body.coupon || {}
        const applied = { ...serverCoupon, discountAmount: Number(body.discount || 0), applicableProducts: body.applicable_products || [] }
        // Aplicar cupón en estado sin reiniciar otros campos
        setAppliedCoupon((prev) => {
          // prevState
          return applied
        })
        try { localStorage.setItem("laf_appliedCoupon", JSON.stringify(applied)) } catch (e) {}
        // applyCoupon after
        return { success: true }
      }
      return { success: false, message: body.reason || "Cupón inválido" }
    } catch (err) {
      console.error("applyCoupon error", err)
      try { toast({ title: "Cupón", description: "Error al aplicar cupón", variant: "destructive" }) } catch (e) {}
      return { success: false, message: "Error al aplicar cupón" }
    }
  }, [items, subtotal, deliveryInfo])

  const removeCoupon = useCallback(() => {
    try { localStorage.removeItem("laf_appliedCoupon") } catch (e) {}
    setAppliedCoupon(null)
  }, [])

  const value: UseCheckoutReturn = {
    currentStep,
    customerData,
    deliveryMethod,
    paymentMethod,
    calculations,
    appliedCoupon,
    isValid,
    goToStep,
    nextStep,
    prevStep,
    updateCustomerData,
    setDeliveryMethod,
    setPaymentMethod,
    submitOrder,
    applyCoupon,
    removeCoupon,
  }

  // Do not render children until we rehydrated saved state to avoid transient empty state
  if (!hydrated) return null

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

function generateWhatsAppMessage(data: any): string {
  const { customer, delivery, payment, calculations, items, orderId } = data
  let message = `🛍️ *NUEVO PEDIDO - LA L FASHION*\n\n`
  message += `👤 *DATOS DEL CLIENTE*\nNombre: ${customer.fullName}\nTeléfono: ${customer.phone}\nEmail: ${customer.email}\nDirección: ${customer.address}\nCiudad: ${customer.city}\n\n`
  message += `📦 *PRODUCTOS*\n`
  items.forEach((item: any, index: number) => { message += `${index + 1}. ${item.product.name}\n`; if (item.size) message += `   Talla: ${item.size}\n`; if (item.color) message += `   Color: ${item.color}\n`; message += `   Cantidad: ${item.quantity}\n`; message += `   Precio: ${formatPrice(item.product.price)}\n\n` })
  message += `🚚 *MÉTODO DE ENTREGA*\n${delivery.description}\n\n💳 *MÉTODO DE PAGO*\n${payment.description}\n\n💰 *RESUMEN DE COSTOS*\nSubtotal: ${formatPrice(calculations.subtotal)}\n`
  if (calculations.deliveryCost > 0) message += `Envío: ${formatPrice(calculations.deliveryCost)}\n`
  if (calculations.discount > 0) message += `Descuento: -${formatPrice(calculations.discount)}\n`
  message += `*TOTAL: ${formatPrice(calculations.total)}*\n\n` + `📅 Fecha: ${new Date().toLocaleDateString("es-ES")}\n⏰ Hora: ${new Date().toLocaleTimeString("es-ES")}`
  if (orderId) message += `\n\n🔖 ID del pedido: ${orderId}`
  return message
}

export default CheckoutContext
