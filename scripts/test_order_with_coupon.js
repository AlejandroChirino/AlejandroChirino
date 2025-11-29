#!/usr/bin/env node
/**
 * Script de prueba: create order with coupon and optionally verify DB rows via Supabase
 * Usage:
 *  node scripts/test_order_with_coupon.js
 * Environment variables:
 *  API_URL - defaults to http://localhost:3000
 *  SUPABASE_URL - optional, for DB verification
 *  SUPABASE_SERVICE_ROLE_KEY - optional, for DB verification
 *  You can also edit the `payload` variable below to match product ids in your DB.
 */

const fetch = require('node-fetch')
const { createClient } = require('@supabase/supabase-js')

const API_URL = process.env.API_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL || null
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null

// --- EDIT HERE: provide product ids that exist in your DB ---
const payload = {
  items: [
    { product_id: "REEMPLAZA_PRODUCTO_1", price: 25000, quantity: 1 },
    { product_id: "REEMPLAZA_PRODUCTO_2", price: 25000, quantity: 1 }
  ],
  shipping_address: { street: "Calle Falsa 123", city: "Ciudad" },
  customer: { fullName: "Juan", email: "juan@example.com" },
  user_id: null,
  appliedCoupon: { code: "CODIGO10" }
}

async function main() {
  try {
    console.log('POST', `${API_URL}/api/orders`)
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload, null, 2),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('Error response:', res.status, data)
      process.exit(1)
    }
    console.log('Order create response:', JSON.stringify(data, null, 2))

    const orderId = data.id || data?.id
    if (!orderId) {
      console.error('No order id returned')
      process.exit(1)
    }

    // If SUPABASE credentials provided, query DB for verification
    if (SUPABASE_URL && SUPABASE_KEY) {
      console.log('Verificando filas en Supabase...')
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

      const { data: orders } = await supabase.from('orders').select('*').eq('id', orderId)
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId)
      const { data: uses } = await supabase.from('coupon_uses').select('*').eq('order_id', orderId)

      console.log('\n--- Orders ---')
      console.log(JSON.stringify(orders, null, 2))
      console.log('\n--- Order Items ---')
      console.log(JSON.stringify(items, null, 2))
      console.log('\n--- Coupon Uses ---')
      console.log(JSON.stringify(uses, null, 2))
    } else {
      console.log('\nNo se proporcionaron credenciales de Supabase. Para verificar filas automáticamente, exporta SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY y vuelve a ejecutar el script.')
      console.log(`Consulta manual en Supabase SQL editor:\nselect * from orders where id = '${orderId}';\nselect * from order_items where order_id = '${orderId}';\nselect * from coupon_uses where order_id = '${orderId}';`)
    }

  } catch (err) {
    console.error('Error en script:', err)
    process.exit(1)
  }
}

main()
