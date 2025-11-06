// Node 18+
const ports = [3000, 3001, process.env.PORT && Number(process.env.PORT)].filter(Boolean)

const payload = {
  productData: {
    name: "Camiseta Test Bulk",
    description: "Producto de prueba (bulk)",
    category: "mujer",
    subcategoria: "camisetas",
    price: 1990,
    sale_price: 0,
    on_sale: false,
    image_url: "",
    sizes: ["S", "M"],
    colors: ["Blanco"],
    stock: 10,
    featured: false,
    is_vip: false,
    is_new: true,
    peso: 250,
    precio_compra: 1200,
    colaboracion_id: null
  },
  quantity: 2,
}

async function tryPost(port) {
  const url = `http://localhost:${port}/api/admin/productos/bulk`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch {
      data = { raw: text }
    }
    return { ok: res.ok, status: res.status, port, data }
  } catch (e) {
    return { ok: false, error: String(e), port }
  }
}

;(async () => {
  for (const port of ports) {
    const r = await tryPost(port)
    if (r.ok) {
      console.log(`[OK] bulk on port ${port}:`, r)
      process.exit(0)
    } else {
      console.warn(`[WARN] bulk on port ${port} failed:`, r)
    }
  }
  console.error('[FAIL] bulk request failed on all tried ports:', ports)
  process.exit(1)
})()
