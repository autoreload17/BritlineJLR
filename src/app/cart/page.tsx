"use client";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  if (items.length === 0) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-24 text-center">
        <h1 className="text-3xl font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-zinc-600 mb-8">Add items to your cart to continue.</p>
        <Link href="/" className="inline-block px-6 py-3 rounded-full bg-[var(--accent-gold)] text-white font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-padded mx-auto max-w-6xl py-12">
      <h1 className="text-3xl font-semibold mb-8">Shopping Cart</h1>

      <div className="grid gap-6 md:grid-cols-[1fr,400px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--border-color)] bg-white p-4 flex gap-4">
              <div className="relative w-24 h-24 bg-silver/20 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 mb-2">
                  {item.brand.replace('-', ' ')} / {item.model.replace(/-/g, ' ')} / {item.year}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{item.price}</div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-white p-6 h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span>Items ({items.length})</span>
              <span>{totalPrice}</span>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{totalPrice}</span>
              </div>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="w-full mb-3 px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-zinc-50"
          >
            Clear Cart
          </button>
          <Link
            href="/contact"
            className="block w-full px-4 py-3 rounded-full bg-[var(--accent-gold)] text-white font-medium text-center hover:bg-[var(--accent-gold)]/90"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}












