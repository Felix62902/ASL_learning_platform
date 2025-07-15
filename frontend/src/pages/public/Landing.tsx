import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../styles/Landing.scss";

function Landing() {
  return (
    <div>
      <Navbar access="Public"></Navbar>
      <div className="landing-container">
        {/* left hand side */}
        <div className="landing-left">
          <h1>Welcome to Mano</h1>
          <p>Your personal ASL Learning Companion</p>
          {/* <button></button> */}
          <Link to="/login" className="btn">
            Get started →
          </Link>
        </div>

        {/* image */}
        <div className="landing-right">image placeholder</div>
      </div>
    </div>
  );
}

export default Landing;
