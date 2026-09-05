"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter flex-1 w-full">
      <div
        className="crt-flash pointer-events-none fixed inset-0 z-[80]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
