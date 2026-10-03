import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href="mailto:hoang.nguyen102@hcmut.edu.vn" data-cursor="disable">
                hoang.nguyen102@hcmut.edu.vn
              </a>
            </p>
            <h4>Phone</h4>
            <p>
              <a href="tel:+84931279469" data-cursor="disable">
                +84 931 279 469
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social & Profile</h4>
            <a
              href="https://github.com/nlmhoagn"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href="mailto:hoang.nguyen102@hcmut.edu.vn"
              data-cursor="disable"
              className="contact-social"
            >
              Email <MdArrowOutward />
            </a>
            <a
              href="./resume.html"
              target="_blank"
              data-cursor="disable"
              className="contact-social"
            >
              Resume / CV <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Nguyen Le Minh Hoang</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
