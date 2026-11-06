"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 pointer-events-none inset-x-0">
      <div className="flex items-center justify-center px-4 sm:px-8 py-4">
        <div className="flex items-center gap-4 sm:gap-8 text-center p-4">
          <Link key="blog" href="/blog" className="group relative py-1 whitespace-nowrap pointer-events-auto">Blog</Link>
        </div>
      </div>
    </header>
  )
}