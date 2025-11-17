import type React from "react"

// Tipos base del dominio
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  sale_price?: number | null
  on_sale?: boolean
  image_url: string | null
  category: ProductCategory
  subcategoria: string | null
  sizes: string[]
  colors: string[]
  stock: number
  featured: boolean
  vip: boolean
  colaboracion_id: string | null
  created_at: string
  updated_at: string
}

// Nuevo tipo para artículos en camino
export interface ArticuloEnCamino {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: ProductCategory
  sizes: string[]
  colors: string[]
  estimated_arrival: string
  preorder_limit: number
  preorder_count: number
  featured: boolean
  created_at: string
  updated_at: string
}

// Actualizar la interfaz CartItem para que sea compatible con nuestro nuevo sistema
export interface CartItem {
  id: string
  product: Product
  quantity: number
  size: string | null
  color: string | null
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products: Product
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: OrderStatus
  shipping_address: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  size: string | null
  color: string | null
  created_at: string
  products: Product
}

// Tipos de utilidad
export type ProductCategory = "hombre" | "mujer" | "unisex" | "accesorios"
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

// Definición de subcategorías por categoría
export const SUBCATEGORIAS = {
  hombre: [
    "Camisas",
    "Chaquetas",
    "Conjuntos",
    "Pullover",
    "Pantalones",
    "Shorts",
    "Abrigos",
    "Chalecos",
    "Zapatillas",
    "Zapatos de vestir",
    "Gorras",
  ],
  mujer: [
    "Blusas / Tops",
    "Pullover cortos",
    "Chaquetas / Chalecos",
    "Faldas",
    "Shorts",
    "Conjuntos",
    "Enterizos",
    "Vestidos",
    "Abrigos",
    "Tacones",
    "Zapatillas",
    "Sandalias",
    "Blumer / Lencería",
    "Bikinis",
  ],
  accesorios: [
    "Ver todo",
    "Bolsos y Carteras",
    "Joyas y Bisutería",
    "Cadenas y Collares",
    "Relojes",
    "Gafas y Lentes",
    "Cintos y Cinturones",
    "Maquillaje y Cosméticos",
    "Medias y Calcetines",
    "Accesorios de Cabello",
    "Gorras y sombreros",
    "Lencería y Protectores",
    "Otros Accesorios",
  ],
  nuevo: ["Hombre", "Mujer", "Accesorios", "Zapatillas nuevas", "Ropa nueva", "Rebajas nuevas"],
  rebajas: ["Hombre", "Mujer", "Accesorios", "Artículos destacados"],
} as const

// Interfaces para API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface SearchFilters {
  category?: ProductCategory | "all"
  subcategoria?: string | "all"
  minPrice?: number
  maxPrice?: number
  limit?: number
}

// Props para componentes
export interface ProductCardProps {
  product: Pick<Product, "id" | "name" | "price" | "sale_price" | "on_sale" | "image_url" | "category" | "subcategoria">
  compact?: boolean
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

// Breadcrumb types
export interface BreadcrumbItem {
  label: string
  href?: string
}

// Hook return types
export interface UseProductReturn {
  product: Product | null
  loading: boolean
  error: string | null
  selectedSize: string | null
  selectedColor: string | null
  activeImageIndex: number
  setSelectedSize: (size: string | null) => void
  setSelectedColor: (color: string | null) => void
  setActiveImageIndex: (index: number) => void
  isValidSelection: boolean
  availableStock: number
}

export interface UseFavoritesReturn {
  favorites: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
  loading: boolean
}

export interface UseCartReturn {
  addToCart: (productId: string, size?: string, color?: string, quantity?: number) => Promise<boolean>
  loading: boolean
  success: boolean
}

// Carousel types
export interface CarouselProps {
  products: Product[]
  title?: string
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

export interface UseCarouselProps {
  totalItems: number
  itemsPerPage: number
  autoPlay?: boolean
  autoPlayInterval?: number
}

export interface UseCarouselReturn {
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

// Añadir tipos para el toast
export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

// Tipos para colaboraciones
export interface Colaboracion {
  id: string
  nombre: string
  descripcion: string | null
  imagenes: string[]
  slug: string
  featured: boolean
  activa: boolean
  created_at: string
  updated_at: string
}

export interface ColaboracionWithProducts extends Colaboracion {
  products: Product[]
  product_count: number
}

// Tipos para mundo La L Fashion
export interface MundoLaFashionItem {
  id: string
  titulo: string
  descripcion: string | null
  imagenes: string[]
  tipo_contenido: "galeria" | "moodboard" | "texto" | "video" | "manifiesto" | "lifestyle"
  orden: number
  activo: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface MundoLaFashionFilters {
  tipo_contenido?: string | "all"
  featured?: boolean
}

// Tipos para VIP
export interface VipFilters {
  category?: ProductCategory | "all"
  subcategoria?: string | "all"
  minPrice?: number
  maxPrice?: number
  sortBy?: "name" | "price" | "newest"
  sortOrder?: "asc" | "desc"
}

// NUEVOS TIPOS PARA CHECKOUT
export type DeliveryMethod = "tienda" | "local" | "municipal"
export type PaymentMethod = "transferencia" | "efectivo_cup" | "efectivo_usd" | "zelle"

export interface CustomerData {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  notes?: string
}

export interface DeliveryInfo {
  method: DeliveryMethod
  cost: number
  isFree: boolean
  description: string
}

export interface PaymentInfo {
  method: PaymentMethod
  discount: number
  description: string
}

export interface CheckoutCalculations {
  subtotal: number
  deliveryCost: number
  discount: number
  total: number
  currency: "CUP" | "USD"
}

export interface CheckoutData {
  customer: CustomerData
  delivery: DeliveryInfo
  payment: PaymentInfo
  calculations: CheckoutCalculations
  items: CartItem[]
}

export interface UseCheckoutReturn {
  currentStep: number
  customerData: CustomerData
  deliveryMethod: DeliveryMethod | null
  paymentMethod: PaymentMethod | null
  calculations: CheckoutCalculations
  isValid: boolean
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateCustomerData: (data: Partial<CustomerData>) => void
  setDeliveryMethod: (method: DeliveryMethod) => void
  setPaymentMethod: (method: PaymentMethod) => void
  submitOrder: () => Promise<boolean>
}
