import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  let resumeTimer: ReturnType<typeof setTimeout> | undefined;
  const resetTimer = setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03);
    resumeTimer = setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2);
    }, 1000);
  }, 2000);
  return () => { clearTimeout(resetTimer); clearTimeout(resumeTimer); };
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  delta: number,
  rotation: THREE.Euler
) => {
  if (!headBone) return;
  if (window.scrollY < 200) {
    const maxRotation = Math.PI / 6;
    rotation.y = THREE.MathUtils.damp(
      rotation.y,
      mouseX * maxRotation,
      interpolationY * 60,
      delta
    );
    const minRotationX = -0.3;
    const maxRotationX = 0.4;
    if (mouseY > minRotationX) {
      if (mouseY < maxRotationX) {
        rotation.x = THREE.MathUtils.damp(
          rotation.x,
          -mouseY - 0.5 * maxRotation,
          interpolationX * 60,
          delta
        );
      } else {
        rotation.x = THREE.MathUtils.damp(
          rotation.x,
          -maxRotation - 0.5 * maxRotation,
          interpolationX * 60,
          delta
        );
      }
    } else {
      rotation.x = THREE.MathUtils.damp(
        rotation.x,
        -minRotationX - 0.5 * maxRotation,
        interpolationX * 60,
        delta
      );
    }
  } else {
    if (window.innerWidth > 1024) {
      rotation.x = THREE.MathUtils.damp(rotation.x, -0.4, 1.8, delta);
      rotation.y = THREE.MathUtils.damp(rotation.y, -0.3, 1.8, delta);
    }
  }
  headBone.rotation.x = rotation.x;
  headBone.rotation.y = rotation.y;
};
