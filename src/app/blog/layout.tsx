import "./blog.css";

export default function BlogLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="os">{children}</div>;
}
