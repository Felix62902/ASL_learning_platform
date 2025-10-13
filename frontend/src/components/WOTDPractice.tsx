import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { useNavigate } from "react-router-dom";
// import "../styles/FreePractice.scss"; // You'll need a stylesheet for this
import { normalizeLandmarks } from "../utils/normalization";
import "../styles/PracticeSession.scss";

import { labels } from "../constants/labels";
import { ExitIcon } from "@radix-ui/react-icons";
import api from "../api";
import Navbar from "./Navbar";

const FALLBACK_WORDS = "MANO";

function WOTDPractice() {
  // --- State for Word Spelling Logic ---
  const [wordToSpell, setWordToSpell] = useState(""); //word
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0); //loop over word
  const [isWordComplete, setIsWordComplete] = useState(false);

  // completedchar, incomplete
  const [completedChar, setCompletedChar] = useState<string[]>([]);
  const [incompleteChar, setIncompleteChar] = useState<string[]>([]);

  // --- Refs for ML and DOM elements ---
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const correctStartTimeRef = useRef<number | null>(null);

  // --- UI and Model State ---
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [prediction, setPrediction] = useState<string>("None");
  const [isReady, setIsReady] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Accepts a list, if fetch word of the day failed, fallback to FALLBACK_WORDS
  const [wordOfTheDay, setWordOfTheDay] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const CORRECT_HOLD_DURATION = 500; // 1.5 seconds

  let navigate = useNavigate();

  // Start the first word when the component loads
  useEffect(() => {
    // startNewWord();
    async function getWOTD() {
      try {
        const response = await api.get("/api/word-of-the-day/");
        if (response?.data?.[0]?.word) {
          setWordOfTheDay(response.data[0].word.toUpperCase());
          setLastUpdate(response.data[0].date);
          //   setWordOfTheDay("CA");
        } else {
          setWordOfTheDay(FALLBACK_WORDS);
        }
      } catch (err) {
        console.error(err);
        setWordOfTheDay(FALLBACK_WORDS);
      } finally {
        setIsLoading(false);
      }
    }
    getWOTD();
  }, []);

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

        setLoadingMessage(""); // Clear loading message
        setIsReady(true); //  Everything is ready now
      } catch (error) {
        console.error("Setup failed:", error);
        setLoadingMessage("Error during setup. Check console.");
      }
    }
    setup();
  }, []);

  // This is the core prediction loop
  useEffect(() => {
    // Determine the character the user should be signing
    const targetCharacter = wordToSpell[currentCharacterIndex];
    if (!targetCharacter || isWordComplete) return; // Stop if no target or word is done

    const detect = async () => {
      if (isReady && webcamRef.current?.video?.readyState === 4) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;

        if (canvas && handLandmarkerRef.current && modelRef.current) {
          const canvasCtx = canvas.getContext("2d");
          if (canvasCtx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // --- This is the only detection call needed ---
            const results = handLandmarkerRef.current.detectForVideo(
              video,
              performance.now()
            );

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.translate(canvas.width, 0);
            canvasCtx.scale(-1, 1);

            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              const drawingUtils = new DrawingUtils(canvasCtx);
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
                const predTensor = modelRef.current.predict(
                  tensor
                ) as tf.Tensor;
                const predArray = (await predTensor.data()) as Float32Array;
                tensor.dispose();
                predTensor.dispose();

                const predictedIndex = predArray.indexOf(
                  Math.max(...predArray)
                );
                const currentPrediction = labels[predictedIndex];
                setPrediction(currentPrediction);

                if (
                  currentPrediction.toUpperCase() ===
                  targetCharacter.toUpperCase()
                ) {
                  if (correctStartTimeRef.current === null) {
                    correctStartTimeRef.current = Date.now();
                  } else if (
                    Date.now() - correctStartTimeRef.current >
                    CORRECT_HOLD_DURATION
                  ) {
                    correctAction(targetCharacter);
                    // setIsCorrect(true);
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
      }
    };

    const intervalId = setInterval(detect, 100);
    return () => clearInterval(intervalId);
  }, [isReady, currentCharacterIndex, wordToSpell, isWordComplete]);

  // initialize incomplete and complete char to word of the day
  useEffect(() => {
    if (wordOfTheDay && !isLoading) {
      setWordToSpell(wordOfTheDay);
      setCurrentCharacterIndex(0);
      setIsWordComplete(false);
      setIsCorrect(false);
      setPrediction("None");
      setIncompleteChar(wordOfTheDay.split("")); // Split into characters
      setCompletedChar([]);
    }
  }, [wordOfTheDay, isLoading]);

  const correctAction = (targetCharacter: string) => {
    setIsCorrect(true);
    setCurrentCharacterIndex((prev) => prev + 1);

    // Update completed characters first
    setCompletedChar((prev) => [...prev, targetCharacter]);

    // Remove last from incompleteChar
    setIncompleteChar((prev) =>
      prev.length > 0 ? prev.slice(1, prev.length) : prev
    );

    // Check if the word is complete AFTER updating the index
    if (currentCharacterIndex + 1 === wordToSpell.length) {
      setIsWordComplete(true);
    }
  };

  // This effect clears the canvas once the word is complete.
  useEffect(() => {
    if (isWordComplete) {
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext("2d");
        if (canvasCtx) {
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [isWordComplete]);

  const backToHome = () => {
    navigate(-1);
  };

  if (isLoading) return <span>Loading</span>;

  // data will be null when fetch call fails
  if (!wordOfTheDay) return <span>Data not available</span>;

  return (
    <div>
      <Navbar access="Private"></Navbar>
      <div className="detector-container">
        <div className="practice-main-container">
          <div className="practice-left-container">
            <div className="word-display-container">
              <h1>Spell:</h1>
              <span className="completed-word" style={{ fontSize: "6rem" }}>
                {completedChar}
              </span>
              <span className="incomplete-word" style={{ fontSize: "6rem" }}>
                {incompleteChar}
              </span>
            </div>

            {isWordComplete ? (
              <div className="completion-message">
                <h3>Word Complete!</h3>
                <button className="nextword-button" onClick={backToHome}>
                  Back to Home Page
                </button>
              </div>
            ) : (
              <div className="prediction-display">
                <h1>Prediction: {prediction}</h1>

                {isWordComplete && (
                  <div
                    className="result-box"
                    style={{ backgroundColor: "green" }}
                  >
                    Correct!
                  </div>
                )}
              </div>
            )}
            <p style={{ position: "absolute", bottom: "3vh", right: "51vw" }}>
              Last Update: {lastUpdate}
            </p>
          </div>
          <div className="practice-right-container">
            <button
              className="practice-backbutton"
              onClick={() => navigate("/home")}
            >
              <ExitIcon></ExitIcon>
              Back to Practice
            </button>
            {/* ... webcam and canvas JSX ... */}
            <div className="video-stack">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                videoConstraints={{ width: 640, height: 480 }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0,
                  zIndex: 10,
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WOTDPractice;
