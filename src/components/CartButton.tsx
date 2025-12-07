"use client";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

export default function CartButton() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Link href="/cart" className="relative flex items-center gap-2 hover:opacity-80">
      <span className="text-sm font-medium">ADDED</span>
      <div className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H16.55C17.3 13 17.96 12.59 18.3 11.97L21.88 6H5.21L4.27 4H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[var(--accent-gold)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
    </Link>
  );
}












