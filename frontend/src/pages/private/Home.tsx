import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../styles/Home.scss";

function Home() {
  return (
    <>
      <div className="title-container">
        <h1>Browse Categories</h1>
        <p>
          Your journey into sign language starts here. Choose a category below
          to begin learning new signs and concepts
        </p>
      </div>

      <div className="cat-container">
        <div className="fgs-container">
          <h3>Fingerspelling</h3>
          <p>
            Master the building blocks of ASL. This section covers the complete
            ASL alphabet, essential for any signer
          </p>
          <Link to="./fingerspelling">Practice →</Link>
        </div>

        {/* right half of the container */}
        <div className="vcb-fp-container">
          <div className="vcb-container">
            <h3>Vocabulary</h3>
            <p>
              Build your conversational skills with essential signs for daily
              life, covering topics from greetings to common objects
            </p>
            <Link to="/vocab">Practice →</Link>
          </div>

          <div className="vcb-container">
            <h3>Free Practice</h3>
            <p>
              Put your knowledge to the test. Review the signs you've learned
              and improve your recognition speed
            </p>
            <p>Practice →</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
