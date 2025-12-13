import type { SupabaseClient } from '@supabase/supabase-js'

type ComputeArgs = {
  admin: SupabaseClient
  code?: string
  coupon_id?: string
  items?: any[]
  subtotal?: number
  deliveryCost?: number
  user_id?: string | null
}

export async function computeCouponDiscount({ admin, code, coupon_id, items = [], subtotal = 0, deliveryCost = 0, user_id = null }: ComputeArgs) {
  try {
    if (!code && !coupon_id) return { valid: false, reason: 'code or coupon_id required' }

    // Find coupon
    let couponRes
    if (coupon_id) {
      couponRes = await admin.from('coupons').select('*').eq('id', coupon_id).limit(1)
    } else {
      couponRes = await admin.from('coupons').select('*').ilike('code', code || '').limit(1)
    }
    const coupon = (couponRes.data && couponRes.data[0]) || null
    if (!coupon) return { valid: false, reason: 'Cupón no encontrado' }

    if (!coupon.active) return { valid: false, reason: 'Cupón inactivo' }

    if (coupon.expires_at) {
      const exp = new Date(coupon.expires_at)
      if (exp < new Date()) return { valid: false, reason: 'Cupón expirado' }
    }

    if (coupon.min_purchase && Number(subtotal) < Number(coupon.min_purchase)) {
      return { valid: false, reason: 'Compra mínima no alcanzada' }
    }

    // Check max uses: prefer usage_count stored on the coupon (avoid expensive COUNT on large tables)
    if (coupon.max_uses) {
      try {
        const usageCount = typeof coupon.usage_count === 'number' ? coupon.usage_count : 0
        if (usageCount >= coupon.max_uses) {
          return { valid: false, reason: 'Límite de usos alcanzado' }
        }
      } catch (e) {
        // Fallback: if for some reason usage_count is not available, perform the count (last resort)
        console.warn('computeCouponDiscount: usage_count not available, falling back to COUNT query', e)
        const { count } = await admin.from('coupon_uses').select('id', { count: 'exact' }).eq('coupon_id', coupon.id)
        if (typeof count === 'number' && count >= coupon.max_uses) {
          return { valid: false, reason: 'Límite de usos alcanzado' }
        }
      }
    }

    // Determine subtotal applicable
    console.time && console.time(`computeCouponDiscount:filter-items:${coupon.id || coupon.code}`)
    let subtotalApplicable = 0
    const applicableProductIds: string[] = []
    const hasRestrictions = (coupon.products && coupon.products.length) || (coupon.categories && coupon.categories.length) || (coupon.subcategories && coupon.subcategories.length) || (coupon.brands && coupon.brands.length) || (coupon.tags && coupon.tags.length)

    for (const it of Array.isArray(items) ? items : []) {
      const p = it.product || it
      let applies = false
      if (!hasRestrictions) applies = true
      if (coupon.products && coupon.products.length && p.id && coupon.products.includes(p.id)) applies = true
      if (coupon.categories && coupon.categories.length && p.category && coupon.categories.includes(p.category)) applies = true
      if (coupon.subcategories && coupon.subcategories.length && p.subcategoria && coupon.subcategories.includes(p.subcategoria)) applies = true
      if (coupon.brands && coupon.brands.length && p.brand && coupon.brands.includes(p.brand)) applies = true
      if (coupon.tags && coupon.tags.length && p.tags && Array.isArray(p.tags)) {
        const intersection = p.tags.filter((t: string) => coupon.tags.includes(t))
        if (intersection.length) applies = true
      }

      if (applies) {
        subtotalApplicable += Number(p.price) * Number(it.quantity || 1)
        if (p.id) applicableProductIds.push(p.id)
      }
    }
    console.time && console.timeEnd(`computeCouponDiscount:filter-items:${coupon.id || coupon.code}`)

    // Calculate discount amount
    let discount = 0
    if (coupon.type === 'percent' && coupon.amount) {
      discount = (subtotalApplicable * Number(coupon.amount)) / 100
    } else if (coupon.type === 'amount' && coupon.amount) {
      discount = Math.min(Number(coupon.amount), subtotalApplicable)
    } else if (coupon.type === 'free_shipping') {
      discount = Number(deliveryCost || 0)
    }

    return { valid: true, coupon: { id: coupon.id, code: coupon.code, type: coupon.type, amount: coupon.amount, description: coupon.description }, discount: Number(discount), subtotal_applicable: subtotalApplicable, applicable_products: applicableProductIds }
  } catch (err) {
    console.error('computeCouponDiscount error', err)
    return { valid: false, reason: 'Error interno' }
  }
}

export async function redeemCoupon({ admin, code, coupon_id, items = [], subtotal = 0, deliveryCost = 0, user_id = null, order_id = null, metadata = {} }: any) {
  // Compute first
  const res = await computeCouponDiscount({ admin, code, coupon_id, items, subtotal, deliveryCost, user_id })
  if (!res || !res.valid) return { success: false, reason: res?.reason || 'invalid' }

  try {
    const useRow: any = {
      coupon_id: coupon_id || (res.coupon && res.coupon.id) || null,
      user_id: user_id || null,
      order_id: order_id || null,
      used_at: new Date().toISOString(),
      metadata: metadata || {},
    }
    const { data: inserted, error: insertErr } = await admin.from('coupon_uses').insert([useRow]).select().single()
    if (insertErr) {
      console.error('failed to insert coupon_use', insertErr)
      return { success: false, reason: 'No se pudo registrar uso' }
    }

    try {
      const cid = coupon_id || (res.coupon && res.coupon.id)
      if (cid) {
        const { data: c } = await admin.from('coupons').select('usage_count').eq('id', cid).maybeSingle()
        const nextCount = (c?.usage_count ?? 0) + 1
        await admin.from('coupons').update({ usage_count: nextCount }).eq('id', cid)
      }
    } catch (e) {
      console.error('failed to update usage_count', e)
    }

    return { success: true, coupon: { id: res.coupon.id, code: res.coupon.code }, discount: res.discount, subtotal_applicable: res.subtotal_applicable, use: inserted }
  } catch (err) {
    console.error('redeemCoupon error', err)
    return { success: false, reason: 'Error interno' }
  }
}

export default { computeCouponDiscount, redeemCoupon }
