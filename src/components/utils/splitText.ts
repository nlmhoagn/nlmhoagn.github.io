import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface SplitTextOptions {
  type?: string;
  linesClass?: string;
  wordsClass?: string;
  charsClass?: string;
}

export class SplitText {
  chars: HTMLElement[] = [];
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];
  elements: HTMLElement[] = [];
  private originalContent: Map<HTMLElement, string> = new Map();

  constructor(
    target: string | string[] | HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
    options?: SplitTextOptions
  ) {
    const rawElements: HTMLElement[] = [];

    if (typeof target === "string") {
      document.querySelectorAll(target).forEach((el) => {
        if (el instanceof HTMLElement) rawElements.push(el);
      });
    } else if (Array.isArray(target)) {
      target.forEach((item) => {
        if (typeof item === "string") {
          document.querySelectorAll(item).forEach((el) => {
            if (el instanceof HTMLElement) rawElements.push(el);
          });
        } else if (item instanceof HTMLElement) {
          rawElements.push(item);
        }
      });
    } else if (target instanceof HTMLElement) {
      rawElements.push(target);
    } else if (target && "forEach" in target) {
      (target as NodeListOf<HTMLElement>).forEach((el) => {
        if (el instanceof HTMLElement) rawElements.push(el);
      });
    }

    this.elements = rawElements;
    const type = options?.type || "chars";
    const linesClass = options?.linesClass;
    const wordsClass = options?.wordsClass;
    const charsClass = options?.charsClass;

    rawElements.forEach((el) => {
      this.originalContent.set(el, el.innerHTML);

      // Clone element to convert <br> into newlines before reading text
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
      const rawText = clone.textContent || "";
      el.innerHTML = "";

      if (linesClass) {
        linesClass.split(" ").filter(Boolean).forEach((cls) => el.classList.add(cls));
      }

      this.lines.push(el);

      const lines = rawText.split("\n");
      lines.forEach((lineText, lineIdx) => {
        if (lineIdx > 0) {
          el.appendChild(document.createElement("br"));
        }

        if (type.includes("words") && !type.includes("chars")) {
          // Words only
          const words = lineText.trim().split(/\s+/).filter(Boolean);
          words.forEach((w, i) => {
            const wordSpan = document.createElement("span");
            wordSpan.className = wordsClass ? `split-word ${wordsClass}` : "split-word";
            wordSpan.style.display = "inline-block";
            wordSpan.textContent = w;
            el.appendChild(wordSpan);
            this.words.push(wordSpan);

            if (i < words.length - 1) {
              el.appendChild(document.createTextNode(" "));
            }
          });
        } else {
          // Chars & words
          const words = lineText.trim().split(/\s+/).filter(Boolean);
          words.forEach((word, wIdx) => {
            const wordWrap = document.createElement("span");
            wordWrap.className = wordsClass ? `split-word ${wordsClass}` : "split-word";
            wordWrap.style.display = "inline-block";
            wordWrap.style.whiteSpace = "nowrap";

            for (let c = 0; c < word.length; c++) {
              const charSpan = document.createElement("span");
              charSpan.className = charsClass ? `split-char ${charsClass}` : "split-char";
              charSpan.style.display = "inline-block";
              charSpan.textContent = word[c];
              wordWrap.appendChild(charSpan);
              this.chars.push(charSpan);
            }

            el.appendChild(wordWrap);
            this.words.push(wordWrap);

            if (wIdx < words.length - 1) {
              const spaceSpan = document.createElement("span");
              spaceSpan.className = "split-space";
              spaceSpan.style.display = "inline-block";
              spaceSpan.innerHTML = "&nbsp;";
              el.appendChild(spaceSpan);
            }
          });
        }
      });
    });
  }

  revert() {
    this.originalContent.forEach((html, el) => {
      el.innerHTML = html;
    });
    this.chars = [];
    this.words = [];
    this.lines = [];
  }
}

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger);

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.innerWidth < 900) return;
  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.progress(1).kill();
      para.split?.revert();
    }

    para.split = new SplitText(para, {
      type: "lines,words",
      linesClass: "split-line",
    });

    if (para.closest(".about-me")) {
      // About Me is smoothly and directly scrubbed by tl1 in GsapScroll.ts
      para.style.opacity = "1";
      para.style.visibility = "visible";
      return;
    }

    para.anim = gsap.fromTo(
      para.split.words,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: "play none none reverse",
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.out",
        y: 0,
        stagger: 0.02,
      }
    );
  });
  titles.forEach((title: ParaElement) => {
    if (title.closest(".about-me")) {
      title.style.opacity = "1";
      title.style.visibility = "visible";
      return;
    }

    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }
    title.split = new SplitText(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    title.anim = gsap.fromTo(
      title.split.chars,
      { opacity: 0, y: 40, rotate: 5 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: "play none none reverse",
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.out",
        y: 0,
        rotate: 0,
        stagger: 0.02,
      }
    );
  });
}
