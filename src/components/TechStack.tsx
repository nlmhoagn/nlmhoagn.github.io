import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BallCollider,
  Physics,
  RigidBody,
  RapierRigidBody,
} from "@react-three/rapier";
import { ScrollSmoother } from "./utils/ScrollSmoother";

function createTechBadgeTexture(name: string, color: string, sub: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = "#120e1c";
  ctx.fillRect(0, 0, 256, 256);

  // Outer glowing ring
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 108, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Subtle inner accent circle
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(128, 128, 92, 0, Math.PI * 2);
  ctx.stroke();

  // Tech Name
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(name, 128, 112);

  // Subtitle/tag
  ctx.fillStyle = color;
  ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(sub, 128, 146);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const techSkills = [
  { name: "Python", color: "#38bdf8", sub: "Core Language" },
  { name: "PyTorch", color: "#f97316", sub: "Deep Learning" },
  { name: "C / C++", color: "#00d2ff", sub: "Systems & Embedded" },
  { name: "OpenCV", color: "#a855f7", sub: "Computer Vision" },
  { name: "YOLO", color: "#22d3ee", sub: "Real-time Detection" },
  { name: "Milvus", color: "#60a5fa", sub: "Vector Database" },
  { name: "ESP32", color: "#fb923c", sub: "IoT Hardware" },
  { name: "TinyML", color: "#e879f9", sub: "Edge Intelligence" },
  { name: "CLIP", color: "#34d399", sub: "Multimodal AI" },
  { name: "Git", color: "#f43f5e", sub: "Version Control" },
];

const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);

const spheres = [...Array(12)].map(() => ({
  scale: [0.75, 1, 0.85, 1, 0.95][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);
  const vec = useRef(new THREE.Vector3());

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;
    delta = Math.min(0.05, delta);
    const trans = api.current.translation();
    vec.current.set(
      trans.x * -50 * delta * scale,
      trans.y * -140 * delta * scale,
      trans.z * -50 * delta * scale
    );

    api.current.applyImpulse(vec.current, true);
  });

  return (
    <RigidBody
      linearDamping={0.8}
      angularDamping={0.2}
      friction={0.25}
      position={[r(18), r(18) - 20, r(18) - 8]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  isActive: boolean;
};

function Pointer({ isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);
  const vec = useRef(new THREE.Vector3());

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;
    vec.current.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current.setNextKinematicTranslation(vec.current);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const techRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    ScrollSmoother.refresh();
    const timer = setTimeout(() => {
      ScrollSmoother.refresh();
    }, 300);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { rootMargin: "200px" }
    );
    if (techRef.current) {
      observer.observe(techRef.current);
    }
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const materials = useMemo(() => {
    return techSkills.map((tech) => {
      const texture = createTechBadgeTexture(tech.name, tech.color, tech.sub);
      return new THREE.MeshPhysicalMaterial({
        map: texture,
        emissive: "#ffffff",
        emissiveMap: texture,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.7,
        clearcoat: 0.2,
      });
    });
  }, []);

  return (
    <div className="techstack" ref={techRef}>
      <h2> My Techstack</h2>

      <Canvas
        eventSource={techRef as unknown as React.MutableRefObject<HTMLElement>}
        gl={{
          alpha: true,
          stencil: false,
          depth: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.4)}
        className="tech-canvas"
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={1.5} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.25}
          color="#ffffff"
          intensity={2}
        />
        <directionalLight position={[0, 5, -4]} intensity={2.5} />
        <pointLight position={[-15, 10, 15]} color="#aa42ff" intensity={1.8} />
        <pointLight position={[15, -10, 10]} color="#38bdf8" intensity={1.2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[i % materials.length]}
              isActive={isActive}
            />
          ))}
        </Physics>
      </Canvas>
    </div>
  );
};

export default TechStack;
