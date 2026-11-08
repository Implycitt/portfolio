import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";

export default async function Blog() {
  const posts = await getBlogPosts();

  const byFolder = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    (acc[post.folder] ??= []).push(post);
    return acc;
  }, {});

  return (

    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-10 border-[1.5] border-rose rounded-2xl bg-overlay text-center shadow-header">

      {Object.entries(byFolder).map(([folder, folderPosts]) => (
        <section key={folder} className="mb-8 text-left last:mb-0">
          <header className="mb-4">
            <h2 className="text-2xl font-bold capitalize text-love">
              {folder}
            </h2>
            <hr className="mt-2 h-0.5 w-full rounded-full border-0 bg-linear-to-r from-rose via-love to-foam bg-size-[200%_200%] animate-shift" />
          </header>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folderPosts.map((post) => (
              <li key={post.path}>
                <div className="group relative flex h-full items-center justify-between gap-3 rounded-xl border border-rose/25 bg-background/40 p-4 text-center transition-colors hover:border-rose hover:bg-background/60 focus-within:outline-offset-2 focus-within:outline-rose focus-within:outline-2">
                  <Link
                    href={`/blog/${folder}/${post.slug}`}
                    className="block min-w-0 truncate text-lg font-bold after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none"
                  >
                    {post.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}