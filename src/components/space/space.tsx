'use client'

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { RaytracedBlackHole } from './BlackHole';
import { Starfield } from './Starfield';

export const SpaceScene = () => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <RaytracedBlackHole />
          <Starfield />
        </Suspense>
      </Canvas>
    </div>
  );
};