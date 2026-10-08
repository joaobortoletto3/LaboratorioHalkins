"use client";

import { Canvas } from "@react-three/fiber";
import { Edges, OrbitControls } from "@react-three/drei";
import type { ShapeSpec } from "@/types";
import type { Lighting } from "./GeometryViewer";

const PALETTE: Record<Lighting, { main: string; edge: string; light: string; ambient: number }> = {
  red: { main: "#3a0b0d", edge: "#ff1b1b", light: "#ff3b3b", ambient: 0.35 },
  cold: { main: "#0b1d3a", edge: "#6aa8ff", light: "#4f8cff", ambient: 0.4 },
  green: { main: "#08240f", edge: "#35ff69", light: "#35ff69", ambient: 0.35 },
};

function Mat({ color, edge }: { color: string; edge: string }) {
  return (
    <>
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.35} transparent opacity={0.88} />
      <Edges color={edge} threshold={15} />
    </>
  );
}

function Solid({ shape, color, edge }: { shape: ShapeSpec; color: string; edge: string }) {
  const d = shape.dims;
  const extent = Math.max(d.w ?? 0, d.d ?? 0, d.a ?? 0, (d.r ?? 0) * 2, (d.h ?? 0) + (d.hp ?? 0) + (shape.kind === "capsule" ? d.r ?? 0 : 0), 1);
  const s = 2.7 / extent;
  switch (shape.kind) {
    case "cube": {
      const a = (d.a ?? 4) * s;
      return (
        <mesh>
          <boxGeometry args={[a, a, a]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    }
    case "box":
      return (
        <mesh>
          <boxGeometry args={[(d.w ?? 6) * s, (d.h ?? 3) * s, (d.d ?? 4) * s]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    case "cylinder":
      return (
        <mesh>
          <cylinderGeometry args={[(d.r ?? 3) * s, (d.r ?? 3) * s, (d.h ?? 6) * s, 48]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    case "cone":
      return (
        <mesh>
          <coneGeometry args={[(d.r ?? 3) * s, (d.h ?? 6) * s, 48]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    case "sphere":
      return (
        <mesh>
          <sphereGeometry args={[(d.r ?? 3) * s, 48, 32]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    case "hemisphere":
      return (
        <mesh>
          <sphereGeometry args={[(d.r ?? 3) * s, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    case "pyramid": {
      const a = (d.a ?? 5) * s;
      return (
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[a / Math.SQRT2, (d.h ?? 5) * s, 4]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    }
    case "prism":
      return (
        <mesh>
          <cylinderGeometry args={[(d.r ?? 3) * s, (d.r ?? 3) * s, (d.h ?? 5) * s, 3]} />
          <Mat color={color} edge={edge} />
        </mesh>
      );
    case "capsule": {
      const r = (d.r ?? 3) * s;
      const h = (d.h ?? 6) * s;
      return (
        <group position={[0, -r * 0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[r, r, h, 48]} />
            <Mat color={color} edge={edge} />
          </mesh>
          <mesh position={[0, h / 2, 0]}>
            <sphereGeometry args={[r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color={color} edge={edge} />
          </mesh>
        </group>
      );
    }
    case "prism-pyramid": {
      const a = (d.a ?? 6) * s;
      const h = (d.h ?? 5) * s;
      const hp = (d.hp ?? 4) * s;
      return (
        <group position={[0, -hp / 3, 0]}>
          <mesh>
            <boxGeometry args={[a, h, a]} />
            <Mat color={color} edge={edge} />
          </mesh>
          <mesh position={[0, h / 2 + hp / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[a / Math.SQRT2, hp, 4]} />
            <Mat color={color} edge={edge} />
          </mesh>
        </group>
      );
    }
    case "hollow-frustum": {
      const outer = d.r * s;
      const top = d.rt * s;
      const hole = d.hole * s;
      const height = d.h * s;
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[top, outer, height, 64, 1, true]} />
            <meshStandardMaterial color={color} roughness={0.45} metalness={0.35} side={2} />
            <Edges color={edge} threshold={15} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[hole, hole, height, 64, 1, true]} />
            <meshStandardMaterial color={color} roughness={0.7} side={2} />
          </mesh>
          <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[hole, outer, 64]} />
            <meshStandardMaterial color={color} side={2} />
          </mesh>
        </group>
      );
    }
    case "portal":
      return (
        <group>
          <mesh>
            <torusGeometry args={[1.1, 0.12, 24, 96]} />
            <meshStandardMaterial color="#ff1b1b" emissive="#d71920" emissiveIntensity={1.4} />
          </mesh>
          <mesh>
            <circleGeometry args={[1.0, 64]} />
            <meshBasicMaterial color="#2a0003" transparent opacity={0.85} />
          </mesh>
        </group>
      );
  }
}

export default function GeometryScene({ shape, lighting, autoRotate, active }: { shape: ShapeSpec; lighting: Lighting; autoRotate: boolean; active: boolean }) {
  const p = PALETTE[lighting];
  return (
    <Canvas frameloop={!active ? "never" : autoRotate ? "always" : "demand"} camera={{ position: [3.2, 2.4, 3.6], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={p.ambient} />
      <pointLight position={[4, 5, 3]} intensity={40} color={p.light} />
      <pointLight position={[-4, -2, -3]} intensity={15} color="#ffffff" />
      <Solid shape={shape} color={p.main} edge={p.edge} />
      <gridHelper args={[8, 16, p.edge, "#1a1d26"]} position={[0, -1.6, 0]} />
      <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={9} autoRotate={active && autoRotate} autoRotateSpeed={1.2} />
    </Canvas>
  );
}
