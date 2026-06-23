'use client';

import { useEffect, useRef } from 'react';

export const ParticleCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const themeColors = {
      cyan: '#2EDFE5', 
      velvet: '#5a189a', 
      violet: '#7b2cbf',
      mauve: '#c77dff'   
    };
    
    const basePalette = [
      themeColors.velvet, 
      themeColors.violet, 
      themeColors.mauve
    ];

    let animationFrameId: number;
    let mouse = { x: -100, y: -100 };
    let core = { x: -100, y: -100 };
    let isHovering = false;
    let isMouseDown = false;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      life: number;
      decay: number;

      constructor(x: number, y: number, isHovering: boolean, isBurst: boolean = false) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * (isHovering ? 3.5 : 2.0) + 0.5;
        
        const velocityMultiplier = isBurst ? 6 : 1;
        this.speedX = (Math.random() * 2 - 1) * velocityMultiplier;
        this.speedY = (Math.random() * 2 - 1) * velocityMultiplier;
        
        this.color = isHovering 
          ? themeColors.cyan 
          : basePalette[Math.floor(Math.random() * basePalette.length)];
          
        this.life = 1.0;
        this.decay = Math.random() * 0.04 + 0.02; 
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const target = e.target as HTMLElement;
      isHovering = !!target.closest('a, button, input, [data-interactive]');

      particles.push(new Particle(mouse.x, mouse.y, isHovering));
    };

    const onMouseDown = () => {
      isMouseDown = true;
      for (let i = 0; i < 12; i++) {
        particles.push(new Particle(mouse.x, mouse.y, isHovering, true));
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      core.x += (mouse.x - core.x) * 0.2;
      core.y += (mouse.y - core.y) * 0.2;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      particles = particles.filter((p) => p.life > 0);

      ctx.globalAlpha = 1;
      
      ctx.fillStyle = isHovering ? themeColors.cyan : themeColors.violet;
      ctx.beginPath();
      const coreRadius = isMouseDown ? 2 : 4; 
      ctx.arc(core.x, core.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isHovering ? themeColors.cyan : themeColors.violet;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      let ringRadius = 12;
      if (isHovering) ringRadius = 24;
      if (isMouseDown) ringRadius = 8;
      
      ctx.globalAlpha = isHovering ? 0.8 : 0.4;
      ctx.arc(core.x, core.y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};