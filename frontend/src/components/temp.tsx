import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

// --- Help
//TODO
// states
// capture webcam images
// using mediapipe to capture landmarks
// normalize landmakrs
// run prediction
// show results

function temp() {
  //Ref to HTML elements
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // states
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  // init, runs when component mounts
  useEffect(() => {
    async function setup() {
      const loadmodel = await tf.loadGraphModel("/web_model/model.json");
      setModel(loadmodel);
    }

    setup();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
      }
    });
  });

  return (
    <>
      <Webcam ref={webcamRef}></Webcam>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default temp;
