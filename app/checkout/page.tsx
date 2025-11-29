import { redirect } from "next/navigation"

export default function CheckoutPage() {
  // Redirige al primer paso del checkout (Datos)
  redirect("/checkout/datos")
}
