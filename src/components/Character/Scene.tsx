import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      const rect = canvasDiv.current.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: THREE.Mesh | THREE.Object3D | null = null;
      let mixer: THREE.AnimationMixer;
      let character: THREE.Object3D | null = null;
      let animations: ReturnType<typeof setAnimations> | undefined;
      let headRotation: THREE.Euler | null = null;
      let disposeHover: (() => void) | undefined;
      let disposed = false;
      let introTimer: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        if (character) handleResize(renderer, camera, canvasDiv, character);
      };

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      const progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera, light.envPromise);

      loadCharacter()
        .then((gltf) => {
          if (gltf && !disposed) {
            animations = setAnimations(gltf);
            if (hoverDivRef.current) {
              disposeHover = animations.hover(gltf, hoverDivRef.current);
            }
            mixer = animations.mixer;
            clock.start();
            character = gltf.scene;
            if (!scene.children.includes(character)) {
              scene.add(character);
            }
            headBone = character.getObjectByName("spine006") || null;
            screenLight = character.getObjectByName("screenlight") || null;
            progress.loaded().then(() => {
              if (disposed) return;
              introTimer = setTimeout(() => {
                light.turnOnLights();
                animations?.startIntro();
              }, 2500);
            });
            window.addEventListener("resize", onResize);
          } else {
            progress.clear();
          }
        })
        .catch((err) => {
          console.error("Failed to load character:", err);
          progress.clear();
        });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let cancelTouchReset: (() => void) | undefined;
      const onTouchMove = (event: TouchEvent) => {
        cancelTouchReset?.();
        handleTouchMove(event, (x, y) => (mouse = { x, y }));
      };

      const onTouchEnd = () => {
        cancelTouchReset?.();
        cancelTouchReset = handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchmove", onTouchMove, { passive: true });
        landingDiv.addEventListener("touchend", onTouchEnd);
      }

      let isVisible = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { rootMargin: "300px" }
      );
      if (canvasDiv.current) {
        observer.observe(canvasDiv.current);
      }

      let animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);
        if (!isVisible) return;
        if (mixer) mixer.update(delta);
        if (headBone && !animations?.isIntroPlaying()) {
          headRotation ??= headBone.rotation.clone();
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            delta,
            headRotation
          );
          light.setPointLight(screenLight);
        }
        renderer.render(scene, camera);
      };
      animate();

      const containerEl = canvasDiv.current;
      return () => {
        disposed = true;
        cancelAnimationFrame(animId);
        observer.disconnect();
        clearTimeout(introTimer);
        cancelTouchReset?.();
        disposeHover?.();
        animations?.dispose();
        progress.clear();
        scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            mesh.geometry.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((material) => material.dispose());
          }
        });
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", onResize);
        if (containerEl && containerEl.contains(renderer.domElement)) {
          containerEl.removeChild(renderer.domElement);
        }
        document.removeEventListener("mousemove", onMouseMove);
        if (landingDiv) {
          landingDiv.removeEventListener("touchmove", onTouchMove);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
