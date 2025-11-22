"use client"

import React from "react"
import CartBadge from "@/components/cart-badge"

export default function ProfileHeader({ name, email }: { name?: string; email?: string }) {
  const displayName = (name ?? "ALEJANDRO").toString().toUpperCase()

  return (
    <div className="relative pt-6 pb-2 px-6">
      {/* Top row: centered small label 'CUENTA' and cart aligned to the right */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <div className="text-sm font-semibold text-gray-500 uppercase text-center">CUENTA</div>
        <div className="flex justify-end">
          <CartBadge className="p-2 hover:bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Greeting block */}
      <div className="mt-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div
              className="text-[clamp(28px,6vw,44px)] font-extrabold uppercase leading-tight tracking-tight break-words whitespace-normal"
              style={{ display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              HOLA, {displayName}
            </div>
            {email && <div className="mt-3 text-sm text-gray-600">{email}</div>}
          </div>

          {/* keep an empty spacer so the greeting can flow but cart is anchored by the top row */}
          <div className="ml-4 flex-shrink-0" aria-hidden>
            {/* empty to preserve layout balance on wide screens */}
          </div>
        </div>
      </div>
    </div>
  )
}
