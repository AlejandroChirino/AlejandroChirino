import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // categories
    const { data: catsData, error: catsError } = await supabase.from('products').select('category')
    if (catsError) throw catsError
    const categories = Array.from(new Set((catsData || []).map((r: any) => r.category).filter(Boolean)))

    // subcategories (subcategoria column)
    const { data: subsData, error: subsError } = await supabase.from('products').select('subcategoria')
    if (subsError) throw subsError
    const subcategories = Array.from(new Set((subsData || []).map((r: any) => r.subcategoria).filter(Boolean)))

    // brands
    const { data: brandsData, error: brandsError } = await supabase.from('products').select('brand')
    if (brandsError) throw brandsError
    const brands = Array.from(new Set((brandsData || []).map((r: any) => r.brand).filter(Boolean)))

    // products (id + name)
    const { data: productsData, error: productsError } = await supabase.from('products').select('id,name,category,subcategoria').limit(200)
    if (productsError) throw productsError
    const products = (productsData || []).map((p: any) => ({ id: p.id, title: p.name }))

    // tags (aggregate arrays)
    const { data: tagsData, error: tagsError } = await supabase.from('products').select('tags')
    if (tagsError) throw tagsError
    const tagSet = new Set<string>()
    ;(tagsData || []).forEach((r: any) => {
      const arr = r.tags || []
      if (Array.isArray(arr)) arr.forEach((t: any) => t && tagSet.add(t))
    })
    const tags = Array.from(tagSet)

    // Build subcategories by category mapping using productsData
    const subcategoriesByCategory: Record<string, string[]> = {}
    ;(productsData || []).forEach((p: any) => {
      const cat = p.category
      const sub = p.subcategoria
      if (!cat || !sub) return
      if (!subcategoriesByCategory[cat]) subcategoriesByCategory[cat] = []
      if (!subcategoriesByCategory[cat].includes(sub)) subcategoriesByCategory[cat].push(sub)
    })

    return NextResponse.json({ categories, subcategories, brands, products, tags, subcategoriesByCategory })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('meta GET error', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
