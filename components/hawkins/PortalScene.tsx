"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending, CanvasTexture, DoubleSide, RepeatWrapping, Vector3, type Group, type PointLight, type Points, type ShaderMaterial } from "three";

const vertex = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const fragment = `
  varying vec2 vUv; uniform float uTime; uniform float uScale; uniform float uReflection;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=0.5;}return v;}
  void main(){
    vec2 p=(vUv-0.5)*2.0; p.x*=1.54; p/=max(uScale,0.001);
    float t=uTime*0.22; float r=length(p); float angle=atan(p.y,p.x);
    vec2 flow=vec2(fbm(p*3.0+vec2(t,-t)),fbm(p*3.0+vec2(-t,t)+17.0));
    float grain=fbm(p*11.0+flow*3.0-vec2(0,t*2.0));
    float edge=0.64+(fbm(p*7.0+flow)-0.5)*0.16+sin(angle*13.0+t)*0.015;
    float dist=abs(r-edge); float rim=exp(-dist*65.0); float halo=exp(-dist*10.0);
    float inside=1.0-smoothstep(edge-0.02,edge+0.02,r);
    float veins=pow(max(0.0,1.0-abs(sin(grain*23.0+angle*2.0-r*12.0))),12.0);
    float depth=fbm(p*5.0+flow*4.0+vec2(0,t));
    vec3 dark=mix(vec3(0.005,0.012,0.024),vec3(0.075,0.12,0.17),depth*depth);
    vec3 col=dark*inside+vec3(0.45,0.018,0.008)*halo*0.5;
    col+=vec3(1.0,0.21,0.055)*rim*(0.7+grain);
    col+=vec3(1.0,0.68,0.40)*pow(rim,4.0)*0.9;
    col+=inside*veins*(vec3(0.24,0.10,0.08)*smoothstep(0.15,0.7,r)+vec3(0.12,0.26,0.38)*0.23);
    float spiral=pow(max(0.0,1.0-abs(sin(angle*2.0+log(r+0.12)*4.0-t*1.6+depth*3.0))),18.0);
    col+=inside*spiral*vec3(0.055,0.13,0.19)*smoothstep(0.07,0.35,r)*(1.0-smoothstep(0.35,0.62,r));
    float alpha=max(inside,halo*0.8)*smoothstep(0.0,0.03,uScale);
    if(uReflection>0.5){col*=0.48;alpha*=0.27*(1.0-vUv.y);}
    gl_FragColor=vec4(col,alpha);
  }
`;

type SceneProps = { active: boolean; reducedMotion: boolean; scale: number; cinematic: boolean; progress: number };

function concreteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const pixels = ctx.createImageData(128, 128);
    let seed = 11;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const n = 43 + (seed % 32);
      pixels.data[i] = n; pixels.data[i + 1] = n + 2; pixels.data[i + 2] = n + 5; pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(5, 5);
  return texture;
}

function Chamber({ reducedMotion, scale, cinematic, progress }: SceneProps) {
  const shader = useRef<ShaderMaterial>(null);
  const reflection = useRef<ShaderMaterial>(null);
  const breach = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const dust = useRef<Points>(null);
  const texture = useMemo(concreteTexture, []);
  const lookAt = useMemo(() => new Vector3(0, 0.4, -2.5), []);
  const cameraTarget = useMemo(() => new Vector3(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 1 }, uReflection: { value: 0 } }), []);
  const mirrorUniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 1 }, uReflection: { value: 1 } }), []);
  const particles = useMemo(() => {
    const positions = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      positions[i * 3] = Math.sin(i * 127.1) * 5;
      positions[i * 3 + 1] = Math.cos(i * 73.3) * 3;
      positions[i * 3 + 2] = Math.sin(i * 31.7) * 3;
    }
    return positions;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock, camera }, delta) => {
    const t = reducedMotion ? 3 : clock.getElapsedTime();
    const lerp = 1 - Math.exp(-Math.min(delta, 0.1) * 4);
    for (const ref of [shader, reflection]) if (ref.current) {
      ref.current.uniforms.uTime.value = t;
      ref.current.uniforms.uScale.value += (scale - ref.current.uniforms.uScale.value) * (reducedMotion ? 1 : lerp);
    }
    if (breach.current) breach.current.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.23) * 0.013;
    if (dust.current && !reducedMotion) { dust.current.rotation.y = Math.sin(t * 0.08) * 0.18; dust.current.position.y = Math.sin(t * 0.13) * 0.3; }
    const surge = Math.pow(Math.max(0, Math.sin(t * 0.83)), 18);
    if (light.current) light.current.intensity = scale * (21 + (reducedMotion ? 0 : surge * 13 + Math.sin(t * 2) * 2));
    if (cinematic && !reducedMotion) {
      const travel = Math.max(0, (progress - 0.68) / 0.32);
      cameraTarget.set(Math.sin(progress * 3.0) * 0.35, 0.48 + progress * 0.15, 7.8 - progress * 2.7 - travel * 3.6);
      camera.position.lerp(cameraTarget, lerp);
    } else camera.position.set(0, 0.65, cinematic ? 7.8 : 4.0);
    camera.lookAt(lookAt);
  });

  return <>
    <color attach="background" args={["#030509"]} /><fog attach="fog" args={["#06080d", 8, 24]} />
    <ambientLight intensity={0.65} color="#8f9dac" />
    <pointLight ref={light} position={[0, 0.5, -0.5]} color="#ff321a" intensity={26} distance={13} decay={2} />
    <pointLight position={[-4, 3, 2]} color="#7ca5cd" intensity={7} distance={13} />
    <pointLight position={[4, 3, -1]} color="#456b93" intensity={7} distance={10} />
    <mesh position={[0, 0.8, -3.15]}><boxGeometry args={[14, 8, 0.4]} /><meshStandardMaterial map={texture} roughness={0.92} metalness={0.12} /></mesh>
    <mesh position={[0, -2.2, 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[20, 24]} /><meshStandardMaterial color="#181b22" map={texture} roughness={0.32} metalness={0.6} /></mesh>
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * 6.4, 1, 2]}><boxGeometry args={[0.7, 7, 13]} /><meshStandardMaterial map={texture} color="#737781" roughness={0.85} /></mesh>
      {[-2, 1, 4].map((z) => <group key={z} position={[side * 5.4, 0, z]}>
        <mesh position={[0, 0.65, 0]}><boxGeometry args={[0.25, 5.7, 0.35]} /><meshStandardMaterial color="#13171e" metalness={0.85} roughness={0.4} /></mesh>
        <mesh position={[0, 2.8, 0.22]}><boxGeometry args={[0.38, 0.08, 0.08]} /><meshBasicMaterial color="#8da7c1" /></mesh>
      </group>)}
      <mesh position={[side * 3.6, -1.3, -0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 7, 8]} /><meshStandardMaterial color="#2b3038" metalness={0.8} roughness={0.35} /></mesh>
      {[-2.5, 0.5, 2.5].map((z) => <mesh key={z} position={[side * 3.6, -1.72, z]}><cylinderGeometry args={[0.04, 0.04, 1, 8]} /><meshStandardMaterial color="#232830" metalness={0.8} /></mesh>)}
      <mesh position={[side * 2.8, 0.4, -2.88]}><boxGeometry args={[0.13, 5.1, 0.2]} /><meshStandardMaterial color="#191c22" metalness={0.6} /></mesh>
      <mesh position={[side * 2.8, 1.9, -2.72]}><boxGeometry args={[0.07, 0.3, 0.06]} /><meshBasicMaterial color="#ad251b" /></mesh>
    </group>)}
    <group ref={breach} position={[0, 0.55, -2.85]}>
      <mesh><planeGeometry args={[6.7, 5.1]} /><shaderMaterial ref={shader} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} toneMapped={false} /></mesh>
    </group>
    <points ref={dust}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial color="#c48d78" size={0.017} transparent opacity={0.45} depthWrite={false} sizeAttenuation />
    </points>
    <mesh position={[0, -2.18, -0.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6.7, 6.7]} /><shaderMaterial ref={reflection} uniforms={mirrorUniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} /></mesh>
  </>;
}

export default function PortalScene(props: SceneProps) {
  return <Canvas frameloop={props.active && !props.reducedMotion ? "always" : "demand"} camera={{ position: [0, 0.65, 7.8], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}>
    <Chamber {...props} />
  </Canvas>;
}
