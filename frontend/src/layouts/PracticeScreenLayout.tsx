// practice screen for both the fingerspelling and freepractice

import { useState } from "react";
import PracticeSession from "../components/PracticeSession";

function PracticeScreenLayout() {
  return (
    <>
      <div>
        <PracticeSession></PracticeSession>
      </div>
    </>
  );
}

export default PracticeScreenLayout;
