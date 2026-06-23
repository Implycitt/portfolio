'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Icons = {
  About: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Projects: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  ),
  Resume: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
};

export const Header = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringTop, setIsHoveringTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setIsHoveringTop(e.clientY < 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const isVisible = !isScrolled || isHoveringTop;

  const navItems = [
    { name: 'About', path: '/about', Icon: Icons.About },
    { name: 'Projects', path: '/projects', Icon: Icons.Projects },
    { name: 'Resume', path: '/resume', Icon: Icons.Resume },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 sm:px-12 mix-blend-difference pointer-events-auto select-none font-mono text-xs tracking-widest uppercase text-white/80 transition-transform duration-500 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      
      <Link href="/" className="hover:text-white transition-colors whitespace-nowrap z-10">
        <span className="hidden sm:inline">[ Quentin Bordelon ]</span>
        <span className="sm:hidden font-bold text-sm">[ Q.B. ]</span>
      </Link>

      <nav className="flex items-center gap-1 sm:gap-6 sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-0">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`group flex items-center justify-center p-2.5 sm:p-3 rounded-full transition-all duration-300 ease-out border
                ${isActive 
                  ? 'border-purple-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <item.Icon />
              
              <span 
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out font-medium
                  ${isActive 
                    ? 'max-w-[100px] opacity-100 ml-2 sm:ml-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400' 
                    : 'max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2 sm:group-hover:ml-3'
                  }
                `}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="text-white/40 hidden md:block z-10">
        PORTFOLIO // 2026
      </div>
      
    </header>
  );
};