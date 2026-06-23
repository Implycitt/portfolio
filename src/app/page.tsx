'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber'
import { MorphingGalaxy } from '@/components/space/MorphingGalaxy';
import { Logo } from '@/components/ui/Logo';

const SpaceScene = dynamic(() => import('@/components/space/space').then(mod => mod.SpaceScene), {
  ssr: false,
});

export default function Portfolio() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [isIntroFading, setIsIntroFading] = useState(false);
  
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('introPlayed');

    if (hasPlayed) {
      setIsFirstVisit(false);
      setIsIntroActive(false);
      setIsIntroFading(true);
    } else {
      sessionStorage.setItem('introPlayed', 'true');

      const fadeTimer = setTimeout(() => {
        setIsIntroFading(true);
      }, 2300); 

      const removeTimer = setTimeout(() => {
        setIsIntroActive(false);
      }, 3200);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = document.body.scrollHeight - window.innerHeight;
          setScrollProgress(maxScroll > 0 ? scrollY / maxScroll : 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="relative h-[300vh] w-full bg-[#181616]">
      
      {isIntroActive && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#181616] transition-all duration-[900ms] cubic-bezier(0.85, 0, 0.15, 1)"
          style={{
            transform: isIntroFading ? 'translateY(100%)' : 'translateY(0%)',
            opacity: isIntroFading ? 0 : 1,
          }}
        >
          <Logo className="w-32 h-32 md:w-40 md:h-40" isAnimating={isFirstVisit} />
        </div>
      )}

      {!isIntroFading && (
        <nav className="fixed top-0 left-0 w-full p-6 sm:p-8 z-40 flex items-center mix-blend-difference pointer-events-auto">
          <Logo className="w-10 h-10" isAnimating={false} />
          <span className="ml-4 font-mono text-white tracking-[0.2em] text-xs sm:text-sm font-bold uppercase">
            Quentin B.
          </span>
        </nav>
      )}

      <div className="fixed inset-0 z-0">
        <SpaceScene />
      </div>
      
      <div 
        className="fixed inset-0 z-10 flex flex-col items-center justify-between p-6 sm:p-12 pointer-events-none select-none transition-opacity duration-300 will-change-opacity"
        style={{ opacity: Math.max(1 - scrollProgress * 3, 0) }}
      >
        <div className="flex flex-col items-center justify-center text-center my-auto">
          <h1 
            className="font-mono text-[14vw] md:text-[9rem] lg:text-[11rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan via-violet to-mauve select-none filter [text-shadow:0_0_40px_rgba(123,44,191,0.5)] md:[-webkit-text-stroke:2px_rgba(255,255,255,0.25)] [-webkit-text-stroke:1px_rgba(255,255,255,0.2)]"
            style={{ WebkitBackgroundClip: 'text' }}
          >
            Quentin
          </h1>
        </div>

        <footer className="w-full flex justify-center mix-blend-difference">
          <div className="flex flex-col items-center gap-2 font-mono text-[10px] tracking-widest text-white/30 animate-pulse uppercase">
            <span>Scroll to Enter</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white to-transparent mt-1" />
          </div>
        </footer>
      </div>

      <div 
        className="fixed inset-0 z-20 transition-opacity duration-500 will-change-opacity"
        style={{ 
          opacity: scrollProgress > 0.8 ? (scrollProgress - 0.8) * 5 : 0,
          pointerEvents: scrollProgress > 0.9 ? 'auto' : 'none' 
        }}
      >
        <div className="absolute inset-0 -z-10">
          <Canvas 
            dpr={1} 
            camera={{ position: [0, 3, 13], fov: 60 }}
            frameloop={scrollProgress > 0.5 ? "always" : "never"} 
          >
            <MorphingGalaxy />
          </Canvas>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 80%)',
            }}
          />

          <div className="text-white text-center relative z-10 p-6">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan via-violet to-mauve drop-shadow-[0_0_20px_rgba(159,134,255,0.4)] mb-8">
              Welcome
            </h2>
            <p className="text-white font-mono max-w-lg mx-auto leading-relaxed text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              I'm Quentin Bordelon a Computer science and Physics undergraduate student at Louisiana State University.
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}