// practice screen for both the fingerspelling and freepractice

import { useState } from "react";
import PracticeSession from "../../components/PracticeSession";
import Navbar from "../../components/Navbar";
import FreePractice from "../../components/FreePractice";

function PracticeFree() {
  return (
    <>
      <div>
        <Navbar access="Private"></Navbar>
        <FreePractice></FreePractice>
      </div>
    </>
  );
}

export default PracticeFree;
