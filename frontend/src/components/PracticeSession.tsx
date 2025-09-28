/*
Filename: PracticeSession.tsx
Author: Jor Lam Wong
Date: 23/8/2025
AI Usage Declaration;
-This file contains code generated with the help of AI tools
- Tool Used: Gemini
-Date generated: 28/7/2025
- AI generated sections are marked with comment #[AI-Generated]
I have reviewed, tested and understood all AI-generated code
*/

import React, { createContext, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/PracticeSession.scss";
import { normalizeLandmarks } from "../utils/normalization";
import {
  ExitIcon,
  ReloadIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
} from "@radix-ui/react-icons";
import { labels } from "../constants/labels";

// main functional component
function PracticeSession({
  unlockedLesson,
  hasPracticedBefore,
  saveProgress,
  lessonId,
  lefthanded,
}: any) {
  // obtain sign to practice from URL (used to verify if user is correct)
  const { sign } = useParams();
  // const [lessonId, setLessonId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  //  Refs for DOM elements and model instances , does not get rerendered
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const videoStackRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 640,
    height: 480,
  });
  //  UI states
  const [loadingMessage, setLoadingMessage] =
    useState<string>("Initializing...");
  const [prediction, setPrediction] = useState<string>("None");
  const [classLabels, setClassLabels] = useState<string[]>([]);
  // only load HTML elements when everything is ready else display as loading
  const [isReady, setIsReady] = useState(false);

  // delays the detection so the user cannot do random signs and pass
  const CORRECT_HOLD_DURATION = 800;
  const correctStartTimeRef = useRef<number | null>(null);

  // State to hold the navigation links
  const [prevSign, setPrevSign] = useState<string | null>(null);
  const [nextSign, setNextSign] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);

  const animationFrameId = useRef<number | null>(null);
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

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

        setClassLabels(labels);
        console.log("Class labels loaded:", labels);

        setLoading(false);
        setLoadingMessage(""); // Clear loading message
        setIsReady(true); //  Everything is ready now
      } catch (error) {
        console.error("Setup failed:", error);
        setLoadingMessage("Error during setup. Check console.");
      }
    }
    setup();
  }, []);

  useEffect(() => {
    if (!videoStackRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });

        // Update canvas dimensions
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;

          // If you're doing any drawing on the canvas, you might need to redraw here
          // redrawCanvas(); // Call your drawing function if needed
        }
      }
    });

    resizeObserver.observe(videoStackRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  //  this effect is for prev and next sign buttons. The user is able to access the next sign only if the next sign is unlocked
  // This effect runs ONLY after the sign changes OR after the unlocked lesson data is loaded.
  // This effect handles the logic for the Previous and Next buttons.
  useEffect(() => {
    // 1. Reset the state every time we navigate to a new sign.
    setCorrect(false);
    setPrediction("None");

    // 2. Ensure all necessary data is loaded before calculating.
    if (sign && !loading) {
      const currentIndex = labels.indexOf(sign.toUpperCase());

      // Previous Sign
      if (currentIndex > 0) {
        let prevIndex = currentIndex - 1;
        // If the previous sign is "Nothing", skip one more.
        if (labels[prevIndex] === "Nothing") {
          prevIndex -= 1;
        }
        // Set the previous sign if the index is still valid.
        setPrevSign(prevIndex >= 0 ? labels[prevIndex] : null);
      } else {
        setPrevSign(null); // We are at the first sign.
      }

      //  Next Sign Logic
      if (currentIndex < labels.length - 1) {
        let nextIndex = currentIndex + 1;
        // If the next sign is "Nothing", skip one more.
        if (labels[nextIndex] === "Nothing") {
          nextIndex += 1;
        }

        // Check if the final potential next sign is valid and unlocked.
        if (nextIndex < labels.length) {
          const potentialNextSign = labels[nextIndex];
          if (unlockedLesson.includes(potentialNextSign)) {
            setNextSign(potentialNextSign);
          } else {
            setNextSign(null); // It's locked.
          }
        } else {
          setNextSign(null); //  at the end of the list.
        }
      } else {
        setNextSign(null); //  at the last sign.
      }
    }
  }, [sign, loading, unlockedLesson]);

  useEffect(() => {
    // This effect runs only when the sign becomes correct
    if (correct && !hasPracticedBefore && lessonId) {
      saveProgress();
    }
  }, [correct, hasPracticedBefore, lessonId]);

  // [AI-generated: Gemini, 23/8/2025 ]
  // Improved prediction loop, now detects latency and fps
  useEffect(() => {
    // the main loop function here
    const predictLoop = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        handLandmarkerRef.current &&
        modelRef.current &&
        labels.length > 0
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        // Start timer
        const startTime = performance.now();

        if (canvas && video) {
          const canvasCtx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if (canvasCtx) {
            const results = handLandmarkerRef.current.detectForVideo(
              video,
              performance.now()
            );
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.translate(canvas.width, 0);
            canvasCtx.scale(-1, 1);

            if (results.landmarks && results.landmarks.length > 0) {
              const drawingUtils = new DrawingUtils(canvasCtx);
              const landmarks = results.landmarks[0];
              drawingUtils.drawConnectors(
                landmarks,
                HandLandmarker.HAND_CONNECTIONS,
                { color: "#00FF00", lineWidth: 2 }
              );
              drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 1,
              });

              const normalizedData = normalizeLandmarks(landmarks);
              if (normalizedData) {
                const tensor = tf.tensor2d([normalizedData]);
                const predictionTensor = modelRef.current.predict(
                  tensor
                ) as tf.Tensor;
                const predictionArray =
                  (await predictionTensor.data()) as Float32Array;
                tensor.dispose();
                predictionTensor.dispose();

                const predictedIndex = predictionArray.indexOf(
                  Math.max(...predictionArray)
                );
                const currentPrediction = labels[predictedIndex];
                setPrediction(currentPrediction);

                if (currentPrediction.toUpperCase() === sign!.toUpperCase()) {
                  if (correctStartTimeRef.current === null) {
                    correctStartTimeRef.current = Date.now();
                  } else if (Date.now() - correctStartTimeRef.current > 800) {
                    // 800ms hold duration
                    setCorrect(true);
                  }
                } else {
                  correctStartTimeRef.current = null;
                }
              }
            } else {
              setPrediction("None");
              correctStartTimeRef.current = null;
            }
            canvasCtx.restore();
          }
        }
        // end timer, calculate metrics
        const endTime = performance.now();
        setLatency(endTime - startTime);

        frameCount.current++;
        if (endTime - lastTime.current > 1000) {
          // Update FPS every second
          setFps(frameCount.current);
          frameCount.current = 0;
          lastTime.current = endTime;
        }
      }
      // Request the next frame
      animationFrameId.current = requestAnimationFrame(predictLoop);
    };

    // Start the loop only after the component is ready
    if (isReady) {
      predictLoop();
    }

    // Cleanup function to stop the loop
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isReady, labels, sign]); // Rerun this effect if dependencies change

  let navigate = useNavigate();

  const handleNavigate = (targetSign: string | null) => {
    if (targetSign) {
      navigate(`/fingerspelling/practice/${targetSign}`);
    }
  };

  const handleRetry = () => {
    setPrediction("None");
    setCorrect(false);
    console.log("Practice session reset for sign:", sign);
  };

  // if (loading) {
  //   return <div>loading</div>;
  // }

  return (
    <div className="detector-container">
      {loadingMessage && (
        <div className="loading-message">{loadingMessage}</div>
      )}
      <div className="practice-main-container">
        {/* left container is for instructions */}
        <div className="practice-left-container">
          <div className="prediction-display">
            <h1 style={{ fontSize: "1.6rem" }}>Now Practicing: {sign}</h1>
            <img
              src={`/assets/images/Sign_language_${sign}.svg`}
              alt="ASL sign"
              style={{
                height: "320px",
                width: "320px",
                transform: lefthanded ? "scaleX(-1)" : "none",
              }}

              // className="sign-image"
            />
            <h1 className="prediction-text">Prediction: {prediction}</h1>
            <div className="navigation-buttons">
              <button
                onClick={() => handleNavigate(prevSign)}
                disabled={!prevSign}
              >
                <TriangleLeftIcon></TriangleLeftIcon>
              </button>

              <button onClick={handleRetry}>
                <ReloadIcon></ReloadIcon>
              </button>

              <button
                onClick={() => handleNavigate(nextSign)}
                disabled={!nextSign}
                data-testid="next-button"
              >
                <TriangleRightIcon></TriangleRightIcon>
              </button>
            </div>

            {correct ? (
              // Case 1: The prediction is correct
              <div className="result-box" style={{ backgroundColor: "green" }}>
                Correct!{" "}
                {hasPracticedBefore
                  ? "(Already Mastered)"
                  : "(Points Awarded!)"}
              </div>
            ) : prediction !== "None" ? (
              // Case 2: A prediction has been made, but it's incorrect
              <div className="result-box" style={{ backgroundColor: "red" }}>
                Incorrect
              </div>
            ) : (
              // Case 3: Default state, no prediction made yet
              <div className="result-box" style={{ backgroundColor: "gray" }}>
                Keep Trying...
              </div>
            )}
          </div>
        </div>

        {/* right container is the actual webcam image */}
        <div className="practice-right-container">
          <button
            className="practice-backbutton"
            onClick={() => navigate("/home/fingerspelling")}
          >
            <ExitIcon></ExitIcon>
            Back to Practice
          </button>
          {isReady ? (
            <div className="video-stack" ref={videoStackRef}>
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                videoConstraints={{
                  width: containerSize.width,
                  height: containerSize.height,
                }}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "auto",
                }}
              />
              <canvas
                ref={canvasRef}
                width={containerSize.width}
                height={containerSize.height}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0,
                  zIndex: 10,
                }}
              />
            </div>
          ) : (
            <div className="loading-message">{loadingMessage}</div>
          )}
          <div className="performance-metrics">
            <p>Latency: {latency.toFixed(0)} ms</p>
            <p>FPS: {fps}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeSession;
