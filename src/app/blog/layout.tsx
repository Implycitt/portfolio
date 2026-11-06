import React from "react";

export default async function BlogLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      {children}
    </div>
  )
}