import Link from 'next/link';

export const ComingSoon = ({ title = "Coming Soon" }: { title?: string }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center overflow-hidden">
      <div className="relative">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-[#0044FF] via-[#9f86ff] to-[#FF007F] opacity-25 blur-3xl"></div>
        
        <h1 className="relative bg-gradient-to-br from-[#00FFFF] to-[#c6b8ff] bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          {title}
        </h1>
      </div>
      
      <div className="z-10 mt-10">
        <Link 
          href="/" 
          className="rounded-full border border-[#9f86ff]/30 bg-[#0044FF]/10 px-8 py-3 text-sm font-medium text-[#c6b8ff] transition-all hover:bg-[#0044FF]/20 hover:shadow-[0_0_20px_rgba(159,134,255,0.4)]"
        >
          Return to Core
        </Link>
      </div>
    </div>
  );
};