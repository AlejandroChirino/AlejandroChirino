import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import Button from "@/components/ui/button"

type Params = { params: { id: string } }

export default async function OrderDetailPage({ params }: Params) {
  // Next may pass `params` as a thenable in some runtimes; await if necessary.
  let id: string
  if (params && typeof (params as any).then === "function") {
    try {
      const resolved = await (params as unknown as Promise<any>)
      id = resolved?.id
    } catch (e) {
      id = (params as any).id
    }
  } else {
    id = (params as any).id
  }

  // Validate id: avoid passing non-UUID segments (like 'nuevo') to the DB query.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    console.warn(`Invalid order id segment: ${String(id)}`)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">ID de orden inválido</h1>
        <p className="text-gray-600 mt-2">El segmento de la URL <strong>{String(id)}</strong> no corresponde a una orden válida.</p>
        {String(id) === "nuevo" ? (
          <p className="mt-3 text-sm">Si quieres crear una orden, visita <a className="text-green-600 underline" href="/admin/pedidos/nuevo">Crear nueva orden</a>.</p>
        ) : null}
      </div>
    )
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id,user_id,total,status,shipping_address,created_at,coupon_code,coupon_description,total_discount")
      .eq("id", id)
      .single()

    if (orderError || !orderData) {
      // Avoid console.error during RSC render (Next intercepts console.error and surfaces as an overlay).
      const errText = orderError ? (typeof orderError === "object" ? JSON.stringify(orderError) : String(orderError)) : "not found"
      console.warn("Order fetch warning:", errText)
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Orden no encontrada</h1>
          <p className="text-gray-600 mt-2">No se pudo localizar la orden con id {id}.</p>
          {errText && <pre className="mt-3 p-2 bg-gray-100 text-xs text-red-600 rounded">{errText}</pre>}
        </div>
      )
    }

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("id,full_name,email,phone,address,city,postal_code")
      .eq("id", orderData.user_id)
      .single()

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("id,order_id,product_id,quantity,price,size,color,discount_amount")
      .eq("order_id", id)

    // Fetch product metadata for items
    let productsMap: Record<string, any> = {}
    if (itemsData && itemsData.length > 0) {
      const productIds = itemsData.map((it: any) => it.product_id)
      const { data: products } = await supabase
        .from("products")
        .select("id,name,price,image_url")
        .in("id", productIds)

      if (products) {
        productsMap = products.reduce((acc: any, p: any) => {
          acc[p.id] = p
          return acc
        }, {})
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button as="a" href="/admin/pedidos/nuevo" variant="primary">Crear otra orden</Button>
                <Button as="a" href="/admin/pedidos" variant="outline">Volver a órdenes</Button>
              </div>
              <div className="text-sm text-gray-600">{new Date(orderData.created_at).toLocaleString()}</div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Orden {orderData.id}</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Cliente</h3>
                <div className="mt-1 text-sm text-gray-800">{profileData?.full_name ?? orderData.user_id}</div>
                <div className="text-xs text-gray-500">{profileData?.email}</div>
                <div className="text-xs text-gray-500">{profileData?.phone}</div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Dirección de envío</h3>
                <div className="mt-1 text-sm text-gray-800">{orderData.shipping_address}</div>
                {profileData?.city && <div className="text-xs text-gray-500">{profileData.city} {profileData.postal_code}</div>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700">Resumen</h3>
                  <div className="mt-1 text-sm text-gray-800">Final: ${orderData.total.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">Estado: {orderData.status}</div>
                  <div className="text-sm mt-2">
                    {orderData.coupon_code ? (
                      <div className="text-sm">
                        <div className="font-medium">Cupón: {orderData.coupon_code}</div>
                        {orderData.coupon_description && <div className="text-xs text-gray-500">{orderData.coupon_description}</div>}
                        <div className="text-xs text-gray-500">Total descontado: ${Number(orderData.total_discount || 0).toFixed(2)}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No se aplicó cupón</div>
                    )}
                  </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium">Items</h3>
              <div className="mt-3 space-y-3">
                {itemsData && itemsData.length > 0 ? (
                  itemsData.map((it: any) => {
                    const prod = productsMap[it.product_id]
                        return (
                      <div key={it.id} className="flex items-center gap-4 p-3 border rounded">
                        {prod?.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">—</div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{prod?.name ?? it.product_id}</div>
                          <div className="text-sm text-gray-500">Cantidad: {it.quantity} • Talla: {it.size ?? '—'} • Color: {it.color ?? '—'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${it.price.toFixed(2)}</div>
                          {typeof it.discount_amount === 'number' && it.discount_amount > 0 ? (
                            <div className="text-xs text-gray-500">Descuento: -${Number(it.discount_amount).toFixed(2)}</div>
                          ) : null}
                          {typeof it.discount_amount === 'number' ? (
                            <div className="text-sm font-medium">Total: ${ (Number(it.price) - Number(it.discount_amount)).toFixed(2) }</div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-gray-500">No hay items en esta orden.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (err) {
    // Use warn to avoid Next's error overlay during RSC rendering
    const repr = err && typeof err === 'object' ? JSON.stringify(err) : String(err)
    console.warn("Error loading order detail:", repr)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-gray-600 mt-2">Ocurrió un error cargando la orden.</p>
      </div>
    )
  }
}
