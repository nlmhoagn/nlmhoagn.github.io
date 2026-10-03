import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container" id="career">
      <div className="career-container">
        <h2>
          Education <span>&</span>
          <br /> Experience
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
              Cumulative GPA: 4.00/4.00 (9.33/10.00). Awarded Academic Encouragement Scholarship
              (Tier 1), Semester 1, AY 2025–2026. Focus: Edge AI, Computer Vision, and Embedded Systems.
            </p>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Project Collaborator</h4>
                <h5>ACLAB</h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              Solar-Powered Roadside Monitoring: Implemented YOLO object detection, lane-region filtering,
              and multi-vehicle tracking on a Kendryte K230 edge AI board to identify stopped vehicles and trigger LED warnings.
            </p>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI & Hardware Competitions</h4>
                <h5>HCMC AI Challenge • UIT • VEDC</h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              Finalist at HCMC AI Challenge (SigLIP, Milvus, ASR/OCR); Developed hybrid legal document
              retrieval for UIT Data Science Challenge; Co-developed ESP32-S3 smart scale with Kalman filtering for Vietnam Electronics Design Contest.
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
              Graduated from High School for the Gifted (VNU-HCM), building strong foundations
              in mathematics, algorithmic thinking, and computer engineering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
