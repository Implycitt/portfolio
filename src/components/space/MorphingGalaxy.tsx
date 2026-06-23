'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MorphingGalaxy = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  const parameters = {
    count: 45000,          
    size: 0.025,           
    radius: 4.5,           
    branches: 4,
    spin: 1.5,             
    randomness: 0.35,      
    randomnessPower: 3.0,  
    
    colorCyan: '#00FFFF',   
    colorBlue: '#0044FF',
    colorPurple: '#9f86ff',
    colorPink: '#FF007F'   
  };

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const cCyan = new THREE.Color(parameters.colorCyan);
    const cBlue = new THREE.Color(parameters.colorBlue);
    const cPurple = new THREE.Color(parameters.colorPurple);
    const cPink = new THREE.Color(parameters.colorPink);
    const cCoreWhite = new THREE.Color('#c6b8ff');

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      let randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      let randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      let randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

      const coreScatter = Math.max(0, 1.2 - radius); 
      if (coreScatter > 0) {
          randomX += (Math.random() - 0.5) * coreScatter * 1.5;
          randomY += (Math.random() - 0.5) * coreScatter * 1.5;
          randomZ += (Math.random() - 0.5) * coreScatter * 1.5;
      }

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.4; 
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = new THREE.Color();
      const colorPick = Math.random();

      if (colorPick < 0.4) {
        mixedColor.copy(cBlue).lerp(cPurple, colorPick / 0.4);
      } else if (colorPick < 0.8) {
        mixedColor.copy(cCyan).lerp(cBlue, (colorPick - 0.4) / 0.4);
      } else {
        mixedColor.copy(cPurple).lerp(cPink, (colorPick - 0.8) / 0.2);
      }

      if (radius < 1.5) {
         const coreColor = Math.random() > 0.5 ? cCyan : cCoreWhite;
         mixedColor.lerp(coreColor, (1.5 - radius) * 0.8);
      }

      mixedColor.multiplyScalar(1.8);

      colors[i3] = Math.min(1.0, mixedColor.r);
      colors[i3 + 1] = Math.min(1.0, mixedColor.g);
      colors[i3 + 2] = Math.min(1.0, mixedColor.b);
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.025; 
    }
  });

  return (
    <group rotation={[Math.PI * 0.15, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={parameters.count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={parameters.count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={parameters.size}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={true}
          transparent={true}
          opacity={1.0} 
        />
      </points>
    </group>
  );
};