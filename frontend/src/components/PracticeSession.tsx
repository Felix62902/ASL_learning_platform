import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

// helper function to normalize landmakrs, identical to the data prep pipeline in python
const normalizeLandmarks = (
  landmarks: NormalizedLandmark[]
): number[] | null => {
  const coords = landmarks.map((lm) => [lm.x, lm.y]); // extract the 21 landmark's x and y val
  const wrist = coords[0];
  const translated = coords.map(([x, y]) => [x - wrist[0], y - wrist[1]]);
  const flat = translated.flat();
  const maxVal = Math.max(...flat.map(Math.abs));

  if (maxVal === 0) return null;
  return flat.map((val) => val / maxVal);
};

// main functional component
function PracticeSession() {
  //  Refs for DOM elements and model instances , does not get rerendered
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  //  UI states
  const [loadingMessage, setLoadingMessage] =
    useState<string>("Initializing...");
  const [prediction, setPrediction] = useState<string>("No Prediction");
  const [classLabels, setClassLabels] = useState<string[]>([]);

  // This useEffect hook runs once to set up the model, task vision landmarker and labels
  useEffect(() => {
    async function setup() {
      console.log("Step 1: Setting up models and webcam...");
      setLoadingMessage("Loading models...");

      try {
        // code is obtainer from npm's mediapipe task-vision package documentation
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
              delegate: "GPU",
            },
            runningMode: "VIDEO", // RUNS ON WEBCAM
            numHands: 1, // SET TO 1
          }
        );
        console.log("MediaPipe HandLandmarker loaded.");

        modelRef.current = await tf.loadGraphModel("/web_model/model.json");
        console.log("TensorFlow.js model loaded.");

        // the 27 label used in the model, order is important
        const labels = [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "Nothing",
          "O",
          "P",
          "Q",
          "R",
          "S",
          "T",
          "U",
          "V",
          "W",
          "X",
          "Y",
          "Z",
        ];
        setClassLabels(labels);
        console.log("Class labels loaded:", labels);

        setLoadingMessage(""); // Clear loading message
      } catch (error) {
        console.error("Setup failed:", error);
        setLoadingMessage("Error during setup. Check console.");
      }
    }
    setup();
  }, []);

  // This sets up the prediction loop.
  useEffect(() => {
    const detect = async () => {
      // Step 2 & 3: Capture image and extract landmarks
      if (
        // make sure everything is ready first
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        handLandmarkerRef.current &&
        modelRef.current &&
        classLabels.length > 0
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        // draws the skeleton in a transparent canvas on top of the video
        if (canvas) {
          const canvasCtx = canvas.getContext("2d"); // working with 2D canvas
          if (canvasCtx) {
            //process current video frame
            const results = handLandmarkerRef.current.detectForVideo(
              video,
              performance.now() // for syncrhonization
            );

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.translate(canvas.width, 0);
            canvasCtx.scale(-1, 1);

            if (results.landmarks && results.landmarks.length > 0) {
              const drawingUtils = new DrawingUtils(canvasCtx);
              const landmarks = results.landmarks[0];

              // draw lines connecting key hand joints
              drawingUtils.drawConnectors(
                landmarks,
                HandLandmarker.HAND_CONNECTIONS,
                { color: "#00FF00", lineWidth: 3 }
              );
              drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 2,
              });

              // Step 4: Normalize the landmark data and run prediction
              const normalizedData = normalizeLandmarks(landmarks);

              if (normalizedData) {
                // Step 5: Pass it as input to ML model to run detect
                const tensor = tf.tensor2d([normalizedData]); // wrap data in model needed by tf
                const predictionTensor = modelRef.current.predict(
                  tensor
                ) as tf.Tensor; // the predicition result is a list of probabilities
                const predictionArray =
                  (await predictionTensor.data()) as Float32Array; // extract results to a JS array for analysis

                // free up GPU/ CPU memory used for performance
                tensor.dispose();
                predictionTensor.dispose();

                // Step 6: Print resulting output from model on screen

                // Find the prediction with the highest confidence score
                const predictedIndex = predictionArray.indexOf(
                  Math.max(...predictionArray)
                );

                // use the index to get the corresponding gesture label
                const currentPrediction = classLabels[predictedIndex];
                setPrediction(currentPrediction);
              }
            } else {
              setPrediction("No Hand Detected");
            }
            canvasCtx.restore();
          }
        }
      }
    };

    const intervalId = setInterval(detect, 100);
    return () => clearInterval(intervalId);
  }, [classLabels]); // Rerun this effect if classLabels change

  return (
    <div className="detector-container">
      <h2>ASL Detector - Final Version</h2>
      {loadingMessage && (
        <div className="loading-message">{loadingMessage}</div>
      )}
      <div className="prediction-display">
        <h1>Prediction: {prediction}</h1>
      </div>
      <div className="video-stack">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          videoConstraints={{ width: 640, height: 480 }}
          style={{
            position: "absolute",
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: "absolute",
            width: 640,
            height: 480,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

export default PracticeSession;
