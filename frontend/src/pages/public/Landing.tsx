/*
Filename: Landing.tsx
Author: Jor Lam Wong
Date: 23/8/2025
AI Usage Declaration;
-This file contains code generated with the help of AI tools
- Tool Used: Gemini
-Date generated: 28/7/2025
- AI generated sections are marked with comment #[AI-Generated]
I have reviewed, tested and understood all AI-generated code
*/

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

        {/* The video below is AI generated */}
        <video
          src="/assets/videos/loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}

export default Landing;
