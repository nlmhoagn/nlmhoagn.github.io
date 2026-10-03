import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              HOANG
              <br />
              <span>NGUYEN</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>Computer Engineering</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">EDGE AI</div>
              <div className="landing-h2-2">VISION</div>
            </h2>
            <h2>
              <div className="landing-h2-info">RESEARCHER</div>
              <div className="landing-h2-info-1">ENGINEER</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
