import { Link } from "react-router-dom";
import "../../styles/Home.scss";
import { LockClosedIcon } from "@radix-ui/react-icons";

function Home() {
  return (
    <>
      <div className="home-title-container">
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
          {/* <div className="vcb-container" style={{ backgroundColor: "#ebebeb" }}>
            <h3>Vocabulary</h3>
            <p>
              Build your conversational skills with essential signs for daily
              life, covering topics from greetings to common objects
            </p>

            <p style={{ fontWeight: "bold" }} className="tooltip">
              Locked
              <LockClosedIcon></LockClosedIcon>
              <span className="tooltiptext">
                Complete Fingerspelling to unlock
              </span>
            </p>
          </div> */}

          <div className="vcb-container">
            <h3>Word Practice</h3>
            <p>
              Put your knowledge to the test by spelling a word character by
              character, no hints given. Review the signs you've learned and
              improve your recognition speed
            </p>
            <Link to="./freePractice">Practice →</Link>
          </div>

          <div className="vcb-container">
            <h3>Word Of The Day</h3>
            <p>Earn points by spelling the word of the day, renewed daily</p>
            <Link to="./wotd">Practice →</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
