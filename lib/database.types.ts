export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: "hombre" | "mujer" | "unisex" | "accesorios"
          subcategoria: string | null
          // Nuevas columnas usadas por la app
          sale_price: number | null
          on_sale: boolean
          is_vip: boolean
          is_new: boolean
          sizes: string[]
          colors: string[]
          stock: number
          featured: boolean
          colaboracion_id: string | null
          peso: number | null
          precio_compra: number | null
          inversion_cup: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category: "hombre" | "mujer" | "unisex" | "accesorios"
          subcategoria?: string | null
          sale_price?: number | null
          on_sale?: boolean
          is_vip?: boolean
          is_new?: boolean
          sizes?: string[]
          colors?: string[]
          stock?: number
          featured?: boolean
          colaboracion_id?: string | null
          peso?: number | null
          precio_compra?: number | null
          inversion_cup?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: "hombre" | "mujer" | "unisex" | "accesorios"
          subcategoria?: string | null
          sale_price?: number | null
          on_sale?: boolean
          is_vip?: boolean
          is_new?: boolean
          sizes?: string[]
          colors?: string[]
          stock?: number
          featured?: boolean
          colaboracion_id?: string | null
          peso?: number | null
          precio_compra?: number | null
          inversion_cup?: number | null
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
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
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          updated_at?: string
        }
      }
      configuracion: {
        Row: {
          precio_libra: number
          valor_dolar: number
        }
        Insert: {
          precio_libra: number
          valor_dolar: number
        }
        Update: {
          precio_libra?: number
          valor_dolar?: number
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          product_id?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          size: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          size?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          quantity?: number
          size?: string | null
          color?: string | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          shipping_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          shipping_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          total?: number
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          shipping_address?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          size: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          quantity?: number
          price?: number
          size?: string | null
          color?: string | null
        }
      }
      colaboraciones: {
        Row: {
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
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          imagenes?: string[]
          slug: string
          featured?: boolean
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nombre?: string
          descripcion?: string | null
          imagenes?: string[]
          slug?: string
          featured?: boolean
          activa?: boolean
          updated_at?: string
        }
      }
      mundo_la_fashion: {
        Row: {
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
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          imagenes?: string[]
          tipo_contenido: "galeria" | "moodboard" | "texto" | "video" | "manifiesto" | "lifestyle"
          orden?: number
          activo?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          titulo?: string
          descripcion?: string | null
          imagenes?: string[]
          tipo_contenido?: "galeria" | "moodboard" | "texto" | "video" | "manifiesto" | "lifestyle"
          orden?: number
          activo?: boolean
          featured?: boolean
          updated_at?: string
        }
      }
      articulos_en_camino: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: "hombre" | "mujer" | "unisex" | "accesorios"
          sizes: string[]
          colors: string[]
          estimated_arrival: string
          preorder_limit: number
          preorder_count: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category: "hombre" | "mujer" | "unisex" | "accesorios"
          sizes?: string[]
          colors?: string[]
          estimated_arrival: string
          preorder_limit?: number
          preorder_count?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: "hombre" | "mujer" | "unisex" | "accesorios"
          sizes?: string[]
          colors?: string[]
          estimated_arrival?: string
          preorder_limit?: number
          preorder_count?: number
          featured?: boolean
          updated_at?: string
        }
      }
    }
  }
}
