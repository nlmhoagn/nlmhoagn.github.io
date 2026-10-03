import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

export interface ScrollSmootherConfig {
  wrapper?: string | HTMLElement;
  content?: string | HTMLElement;
  smooth?: number;
  speed?: number;
  effects?: boolean;
  autoResize?: boolean;
  ignoreMobileResize?: boolean;
}

export class ScrollSmoother {
  private lenis: Lenis | null = null;
  private isPaused: boolean = false;
  private tickerFn: ((time: number) => void) | null = null;
  private static instance: ScrollSmoother | null = null;

  constructor(config?: ScrollSmootherConfig) {
    if (typeof window !== "undefined") {
      this.lenis = new Lenis({
        duration: config?.smooth ? Math.min(config.smooth, 1.4) : 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      this.lenis.on("scroll", () => {
        ScrollTrigger.update();
      });

      this.tickerFn = (time: number) => {
        this.lenis?.raf(time * 1000);
      };
      gsap.ticker.add(this.tickerFn);
      gsap.ticker.lagSmoothing(0);
    }
  }

  static create(config?: ScrollSmootherConfig): ScrollSmoother {
    if (ScrollSmoother.instance) {
      ScrollSmoother.instance.kill();
    }
    ScrollSmoother.instance = new ScrollSmoother(config);
    return ScrollSmoother.instance;
  }

  static get(): ScrollSmoother | null {
    return ScrollSmoother.instance;
  }

  static refresh(..._args: unknown[]) {
    ScrollTrigger.refresh();
  }

  scrollTop(val?: number): number {
    if (typeof val === "number") {
      if (this.lenis) {
        this.lenis.scrollTo(val, { immediate: true });
      }
      window.scrollTo(0, val);
      return val;
    }
    return this.lenis?.scroll ?? window.scrollY;
  }

  paused(pause?: boolean): boolean {
    if (typeof pause === "boolean") {
      this.isPaused = pause;
      if (pause) {
        this.lenis?.stop();
        document.body.style.overflow = "hidden";
      } else {
        this.lenis?.start();
        document.body.style.overflow = "auto";
      }
      return pause;
    }
    return this.isPaused;
  }

  scrollTo(
    target: string | HTMLElement | null,
    smooth: boolean = true,
    ..._args: unknown[]
  ) {
    if (!target) return;
    const dest =
      typeof target === "string" ? (document.querySelector(target) as HTMLElement) : target;
    if (dest) {
      if (this.lenis) {
        this.lenis.scrollTo(dest, {
          immediate: !smooth,
          duration: smooth ? 1.2 : 0,
        });
      } else {
        dest.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      }
    }
  }

  kill() {
    if (this.tickerFn) {
      gsap.ticker.remove(this.tickerFn);
    }
    this.lenis?.destroy();
    this.lenis = null;
  }
}

export default ScrollSmoother;
