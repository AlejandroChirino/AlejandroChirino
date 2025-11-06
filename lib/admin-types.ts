export interface ProductFormData {
  name: string
  description: string
  category: string
  subcategoria: string
  price: number
  sale_price?: number
  on_sale: boolean
  peso: number
  precio_compra: number
  sizes: string[]
  colors: string[]
  stock: number
  featured: boolean
  is_vip: boolean
  is_new: boolean
  image_url?: string
  colaboracion_id?: string
}

export interface ConfiguracionData {
  precio_libra: number
  valor_dolar: number
}

export interface ProductWithCalculations extends ProductFormData {
  id: string
  inversion_cup: number
  created_at: string
  updated_at: string
}

export interface AdminFilters {
  search?: string
  category?: string
  subcategoria?: string
  is_vip?: boolean
  is_new?: boolean
  featured?: boolean
  on_sale?: boolean
}
