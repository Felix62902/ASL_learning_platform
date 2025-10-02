// practice screen for both the fingerspelling and freepractice

import { useState } from "react";
import PracticeSession from "../../components/PracticeSession";
import Navbar from "../../components/Navbar";
import FreePractice from "../../components/FreePractice";
import "../../styles/PracticeAlpha.scss";

function PracticeFree() {
  return (
    <>
      <div className="practiceAlpha-container">
        <Navbar access="Private"></Navbar>
        <div className="practiceAlpha-content">
          <FreePractice></FreePractice>
        </div>
      </div>
    </>
  );
}

export default PracticeFree;
