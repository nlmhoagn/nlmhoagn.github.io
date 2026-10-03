import * as THREE from "three";
import gsap from "gsap";

export function setCharTimeline(
  character: THREE.Object3D<THREE.Object3DEventMap> | null,
  camera: THREE.PerspectiveCamera
) {
  let intensity: number = 0;
  setInterval(() => {
    intensity = Math.random();
  }, 200);
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  let screenLight: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | undefined;
  let monitor: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | undefined;

  character?.children.forEach((object: THREE.Object3D) => {
    if (object.name === "Plane004") {
      object.children.forEach((child: THREE.Object3D) => {
        const meshChild = child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
        if (meshChild.material) {
          meshChild.material.transparent = true;
          meshChild.material.opacity = 0;
          if (meshChild.material.name === "Material.027") {
            monitor = meshChild;
            meshChild.material.color.set("#FFFFFF");
          }
        }
      });
    }
    if (object.name === "screenlight") {
      const meshObj = object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
      if (meshObj.material) {
        meshObj.material.transparent = true;
        meshObj.material.opacity = 0;
        meshObj.material.emissive.set("#C8BFFF");
        gsap.timeline({ repeat: -1, repeatRefresh: true }).to(meshObj.material, {
          emissiveIntensity: () => intensity * 8,
          duration: () => Math.random() * 0.6,
          delay: () => Math.random() * 0.1,
        });
        screenLight = meshObj;
      }
    }
  });
  const neckBone = character?.getObjectByName("spine005");
  if (window.innerWidth > 1024) {
    if (character) {
      tl1
        .fromTo(character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
        .to(camera.position, { z: 22 }, 0)
        .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
        .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
        .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
        .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

      tl2
        .to(
          camera.position,
          { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
          0
        )
        .to(".about-section", { y: "30%", duration: 6 }, 0)
        .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
        .fromTo(
          ".character-model",
          { pointerEvents: "inherit" },
          { pointerEvents: "none", x: "-4%", delay: 2, duration: 5 },
          0
        )
        .to(character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0)
        .to(neckBone!.rotation, { x: 0.6, delay: 2, duration: 3 }, 0);

      if (monitor) {
        tl2
          .to(monitor.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0)
          .fromTo(
            monitor.position,
            { y: -10, z: 2 },
            { y: 0, z: 0, delay: 1.5, duration: 3 },
            0
          );
      }
      if (screenLight) {
        tl2.to(screenLight.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0);
      }

      tl2
        .fromTo(
          ".what-box-in",
          { display: "none" },
          { display: "flex", duration: 0.1, delay: 6 },
          0
        )
        .fromTo(
          ".character-rim",
          { opacity: 1, scaleX: 1.4 },
          { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
          0.3
        );

      tl3
        .fromTo(
          ".character-model",
          { y: "0%" },
          { y: "-100%", duration: 4, ease: "none", delay: 1 },
          0
        )
        .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
        .to(character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);
    }
  } else {
    if (character) {
      const tM2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".what-box-in",
          start: "top 70%",
          end: "bottom top",
        },
      });
      tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
    }
  }
}

export function setAllTimeline() {
  const careerBlocks = document.querySelectorAll(".career-block");
  careerBlocks.forEach((block) => {
    const timeline = block.querySelector(".career-timeline");
    const infoBoxes = block.querySelectorAll(".career-info-box");
    const dot = block.querySelector(".career-dot");

    if (timeline) {
      const blockTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: block,
          start: "top 65%",
          end: "bottom 70%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      blockTimeline
        .fromTo(
          timeline,
          { maxHeight: "0%", opacity: 0 },
          { maxHeight: "100%", opacity: 1, duration: 0.8, ease: "none" },
          0
        )
        .fromTo(
          infoBoxes,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power1.out" },
          0.05
        );

      if (dot) {
        blockTimeline.fromTo(
          dot,
          { animationIterationCount: "infinite" },
          {
            animationIterationCount: "1",
            delay: 0.3,
            duration: 0.1,
          },
          0
        );
      }
    }
  });
}
