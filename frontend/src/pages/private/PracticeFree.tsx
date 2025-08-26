// practice screen for both the fingerspelling and freepractice

import { useState } from "react";
import PracticeSession from "../../components/PracticeSession";
import Navbar from "../../components/Navbar";

function PracticeFree() {
  return (
    <>
      <div>
        <Navbar access="Private"></Navbar>
        <PracticeSession></PracticeSession>
      </div>
    </>
  );
}

export default PracticeFree;
