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

  constructor(_config?: ScrollSmootherConfig) {
    if (typeof window !== "undefined") {
      this.lenis = new Lenis({
        lerp: 0.1,
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
      });

      this.lenis.on("scroll", () => {
        ScrollTrigger.update();
      });

      this.tickerFn = (time: number) => {
        this.lenis?.raf(time * 1000);
      };
      gsap.ticker.add(this.tickerFn);
      gsap.ticker.lagSmoothing(500, 33);

      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => {
          this.lenis?.resize();
          ScrollTrigger.refresh();
        });
        const target =
          typeof _config?.content === "string"
            ? document.querySelector(_config.content)
            : _config?.content || document.getElementById("smooth-content") || document.body;
        if (target) {
          this.resizeObserver.observe(target);
        }
      }
    }
  }

  private resizeObserver: ResizeObserver | null = null;

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
    ScrollSmoother.instance?.lenis?.resize();
    ScrollTrigger.refresh();
  }

  resize() {
    this.lenis?.resize();
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
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.tickerFn) {
      gsap.ticker.remove(this.tickerFn);
    }
    this.lenis?.destroy();
    this.lenis = null;
    ScrollSmoother.instance = null;
  }
}

export default ScrollSmoother;
