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
                Applied Cryptography and Computer Vision Lab at HCMUT.
                Phòng thí nghiệm nghiên cứu chuyên sâu về Mật mã Ứng dụng, Thị giác Máy tính và các giải pháp Trí tuệ Nhân tạo Biên (Edge AI) trực thuộc Trường Đại học Bách Khoa – ĐHQG TP.HCM.
                <br />
                <a
                  href="https://www.facebook.com/aclabhcumt/"
                  target="_blank"
                  rel="noreferrer"
                  className="career-link"
                >
                  Facebook <MdArrowOutward />
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
                Ubiquitous, Resilient &amp; Autonomous Systems Research Group at HCMUT.
                Nhóm nghiên cứu trọng điểm tập trung vào các hệ thống thông minh tự hành (Autonomous Systems), IoT phân tán, mạng không dây và thiết bị bay không người lái (UAV) tại Trường Đại học Bách Khoa – ĐHQG TP.HCM.
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
                Trường Đại học Bách Khoa – ĐHQG TP.HCM (2022 – Hiện tại).
                Cumulative GPA: 4.00/4.00 (9.33/10.00). Đạt Học bổng Khuyến khích Học tập loại Xuất sắc (Tier 1), Học kỳ 1, năm học 2025–2026. Định hướng chuyên sâu: Edge AI, Computer Vision và Hệ thống Nhúng.
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
                Trường Phổ thông Năng khiếu – Đại học Quốc gia TP.HCM (2019 – 2022).
                Tốt nghiệp khối chuyên với nền tảng vững vàng về toán học giải tích, cấu trúc dữ liệu thuật toán và lập trình khoa học máy tính.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
