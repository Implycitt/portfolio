'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const RaytracedBlackHole = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();
  
  const texture = useTexture('/accretion_disk.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uTexture: { value: texture },
    uScroll: { value: 0 }, 
  }), [texture, size]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
      
      materialRef.current.uniforms.uScroll.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uScroll.value,
        scrollProgress,
        0.05
      );
    }
  });

  return (
    <mesh renderOrder={1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec2 uResolution;
          uniform sampler2D uTexture;
          uniform float uTime;
          uniform float uScroll;

          varying vec2 vUv;

          const float RS = 1.0; 
          const int MAX_STEPS = 120; 
          const float STEP_SIZE = 0.25; 

          mat2 rot(float a) {
            float s = sin(a), c = cos(a);
            return mat2(c, -s, s, c);
          }

          void main() {
            vec2 uv = (vUv - 0.5) * 2.0;
            if (uResolution.x > uResolution.y) {
                uv.x *= uResolution.x / uResolution.y;
            } else {
                uv.y *= uResolution.y / uResolution.x;
            } 

            float plunge = uScroll * uScroll * uScroll; 
            vec3 ro = mix(vec3(0.0, 0.0, 24.0), vec3(0.0, 0.0, 0.0), plunge);
            float baseFov = uResolution.x > uResolution.y ? -1.2 : -1.0;
            float currentFov = mix(baseFov, -3.0, plunge);
            vec3 rd = normalize(vec3(uv, currentFov)); 
            ro.yz *= rot(0.06);
            rd.yz *= rot(0.06);

            vec3 pos = ro;
            vec3 dir = rd;
            
            vec3 col = vec3(0.0);
            float hitEventHorizon = 0.0;
            float alphaAccum = 0.0; 
            
            for(int i = 0; i < MAX_STEPS; i++) {
              float rSq = dot(pos, pos); 
              
              if(rSq < 1.0) { 
                  hitEventHorizon = 1.0;
                  break;
              }
              
              if(rSq > 900.0 || alphaAccum >= 1.0) { 
                  break;
              }
              
              vec3 accel = -pos * (1.0 / (rSq * sqrt(rSq))); 
              dir = normalize(dir + accel * STEP_SIZE * 2.0); 
              vec3 nextPos = pos + dir * STEP_SIZE;
              
              if(pos.y * nextPos.y < 0.0) {
                float t = -pos.y / dir.y;
                vec3 hitPos = pos + dir * t;
                float hitRSq = dot(hitPos, hitPos);
                
                if(hitRSq > 6.25 && hitRSq < 144.0) {
                  float hitR = sqrt(hitRSq);
                  float texU = (hitR - 2.5) / 9.5; 
                  float texV = atan(hitPos.z, hitPos.x) / 6.283185 + 0.5;
                  
                  texV += uTime * 0.02;
                  vec4 diskTex = texture2D(uTexture, vec2(texU, texV));
                  
                  float edgeFade = smoothstep(12.0, 9.0, hitR) * smoothstep(2.5, 3.0, hitR);
                  vec3 diskVelocity = normalize(vec3(-hitPos.z, 0.0, hitPos.x)); 
                  
                  float doppler = 1.0 + dot(dir, diskVelocity) * 0.4; 
                  
                  vec3 glow = diskTex.rgb * edgeFade * doppler;
                  col += glow * (1.0 - alphaAccum);
                  alphaAccum += length(glow) * 0.5; 
                }
              }
              pos = nextPos;
            }
            
            float finalAlpha = alphaAccum; 
            
            if(hitEventHorizon == 1.0) {
              finalAlpha = 1.0; 
            }
            
            gl_FragColor = vec4(col, min(finalAlpha, 1.0));
          }
        `}
      />
    </mesh>
  );
};