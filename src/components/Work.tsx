import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const Work = () => {
  useGSAP(() => {
    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      const container = document.querySelector(".work-container");
      if (!box || box.length === 0 || !container || !box[0].parentElement) return;

      const rectLeft = container.getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement.getBoundingClientRect().width;
      const padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
    }

    setTranslateX();

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: () => `+=${translateX}`,
        scrub: true,
        pin: true,
        id: "work",
        invalidateOnRefresh: true,
      },
    });

    timeline.to(".work-flex", {
      x: () => -translateX,
      ease: "none",
    });

    const handleResize = () => {
      setTranslateX();
      ScrollTrigger.getById("work")?.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);
  const BASE_URL = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + "/";

  const projects = [
    {
      num: "01",
      title: "Emergency-Lane Monitor",
      category: "ACLAB • Project Collaborator",
      tools: "K230 Edge AI Board, YOLO Detection, Vehicle Tracking, Solar IoT",
      image: `${BASE_URL}images/project-lane-monitoring.svg`,
      link: "https://github.com/nlmhoagn",
    },
    {
      num: "02",
      title: "Traffic Video VQA",
      category: "HCMC AI Challenge • Finalist",
      tools: "CLIP/SigLIP, Milvus, OCR/ASR, LLM Query Expansion",
      image: `${BASE_URL}images/project-traffic-video.svg`,
      link: "https://github.com/nlmhoagn",
    },
    {
      num: "03",
      title: "Legal Document Retrieval",
      category: "UIT Data Science Challenge",
      tools: "Structure-Aware Chunking, BM25, Dense Embeddings, Cross-Encoder",
      image: `${BASE_URL}images/project-legal-retrieval.svg`,
      link: "https://github.com/nlmhoagn",
    },
    {
      num: "04",
      title: "ESP32-S3 Health Scale",
      category: "Vietnam Electronics Design Contest",
      tools: "ESP32-S3, FSR Sensors, Kalman Filtering, Rollback OTA",
      image: `${BASE_URL}images/project-esp32-scale.svg`,
      link: "https://github.com/nlmhoagn",
    },
    {
      num: "05",
      title: "UAV Swarm FL",
      category: "Current Research Focus",
      tools: "Federated Learning, UAV Networks, TinyML, PyTorch",
      image: `${BASE_URL}images/project-uav-fl.svg`,
      link: "https://github.com/nlmhoagn",
    },
    {
      num: "06",
      title: "On-Device LLMs & Reasoning",
      category: "Research Interests",
      tools: "On-Device LLMs, Graph Reasoning, TinyML, Quantization",
      image: `${BASE_URL}images/project-ondevice-llm.svg`,
      link: "https://github.com/nlmhoagn",
    },
  ];

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{project.num}</h3>

                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} link={project.link} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
