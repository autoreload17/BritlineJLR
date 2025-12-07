"use client";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo-container">
      <span className="logo-text">
        Britline
      </span>
      <span className="jlr-text">
        JLR
      </span>
    </Link>
  );
}

