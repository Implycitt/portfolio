"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="flex pointer-events-none inset-x-0 items-center justify-center pt-10">
      <div className="flex items-center justify-center sm:px-3 py-2 rounded-full border-3 border-overlay w-fit bg-overlay shadow-header">
        <div className="flex items-center gap-4 sm:gap-8 text-center p-4">
          <Link key="home" href="/" className="group relative py-1 whitespace-nowrap pointer-events-auto">
            Home
          </Link>

          <Link key="projects" href="/projects" className="group relative py-1 whitespace-nowrap pointer-events-auto">
            Projects 
          </Link>
          
          <Link key="blog" href="/blog" className="group relative py-1 whitespace-nowrap pointer-events-auto">
            Blog
          </Link>
        </div>
      </div>
    </header>
  )
}