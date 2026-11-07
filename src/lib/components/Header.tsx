"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="pointer-events-none sticky top-15 z-50 flex h-26 items-center justify-center">
      <div className="group -m-6 p-6 pointer-events-auto">
        <div className="flex w-fit items-center justify-center overflow-hidden rounded-full border-3 border-overlay bg-overlay shadow-header px-3 py-2 max-h-28 transition-[max-height,padding] duration-300 ease-out motion-reduce:transition-none sm:max-h-2 sm:px-0 sm:py-0 sm:group-hover:max-h-28 sm:group-hover:px-3 sm:group-hover:py-2 sm:group-focus-within:max-h-28 sm:group-focus-within:px-3 sm:group-focus-within:py-2 m:max-h-2 sm:min-w-48">
          <div className="grid grid-cols-[1fr] transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none sm:grid-cols-[0fr] sm:group-hover:grid-cols-[1fr] sm:group-focus-within:grid-cols-[1fr]">
            <div className="flex min-w-0 items-center gap-4 overflow-hidden p-4 text-center sm:gap-8 opacity-0 transition-opacity duration-200 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
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
        </div>
      </div>
    </header>
  )
}
