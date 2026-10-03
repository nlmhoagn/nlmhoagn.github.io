import { MdArrowOutward } from "react-icons/md";
import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container" id="career">
      <div className="career-container">
        {/* --- SECTION 1: RESEARCH EXPERIENCE --- */}
        <div className="career-block">
          <h2>
            Research <span>&</span>
            <br /> Experience
          </h2>
          <div className="career-info">
            <div className="career-timeline">
              <div className="career-dot"></div>
            </div>

            <div className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>ACLab</h4>
                  <h5>Research Member</h5>
                </div>
                <h3>2026</h3>
              </div>
              <p>
                Applied Cryptography and Computer Vision Lab at Ho Chi Minh City University of Technology (HCMUT). Research laboratory specializing in Applied Cryptography, Computer Vision, and Edge AI solutions.
                <br />
                <a
                  href="https://www.facebook.com/aclabhcumt/"
                  target="_blank"
                  rel="noreferrer"
                  className="career-link"
                >
                  ACLab Facebook <MdArrowOutward />
                </a>
              </p>
            </div>

            <div className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>URA Lab</h4>
                  <h5>Research Member</h5>
                </div>
                <h3>2026</h3>
              </div>
              <p>
                Ubiquitous, Resilient &amp; Autonomous Systems Research Group at Ho Chi Minh City University of Technology (HCMUT). Research group focusing on autonomous intelligent systems, distributed IoT, wireless networking, and unmanned aerial vehicles (UAVs).
                <br />
                <a
                  href="https://ura.hcmut.edu.vn/"
                  target="_blank"
                  rel="noreferrer"
                  className="career-link"
                >
                  URA Research Group <MdArrowOutward />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: ACADEMIC EDUCATION --- */}
        <div className="career-block career-block-education">
          <h2>
            Academic <span>&</span>
            <br /> Education
          </h2>
          <div className="career-info">
            <div className="career-timeline">
              <div className="career-dot"></div>
            </div>

            <div className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>Computer Engineering</h4>
                  <h5>HCMUT — VNU-HCM</h5>
                </div>
                <h3>NOW</h3>
              </div>
              <p>
                Ho Chi Minh City University of Technology – VNU-HCM (2022 – Present).
                <br />
                Cumulative GPA: 4.00/4.00 (9.33/10.00). Awarded Academic Encouragement Scholarship (Tier 1 - Excellent), Semester 1, Academic Year 2025–2026. Specialization: Edge AI, Computer Vision, and Embedded Systems.
              </p>
            </div>

            <div className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>Gifted High School</h4>
                  <h5>High School for the Gifted (PTNK)</h5>
                </div>
                <h3>2022</h3>
              </div>
              <p>
                High School for the Gifted – Vietnam National University HCMC (2019 – 2022).
                <br />
                Graduated with honors, establishing a rigorous foundation in mathematical analysis, algorithmic data structures, and computer science.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
