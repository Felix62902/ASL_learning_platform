import React from "react";
import "../../styles/About.scss"; // Create this new SCSS file for styling
import Navbar from "../../components/Navbar";

function About() {
  return (
    <>
      <Navbar access="Public"></Navbar>

      <div className="about-container">
        <div className="about-header">
          <h1>About Mano</h1>
          <p className="about-subtitle">
            An AI-Powered Tutor for American Sign Language (ASL)
          </p>
        </div>

        <div className="about-section">
          <h2>What is Mano?</h2>
          <p>
            Mano is a web application designed to address a critical gap in
            digital language learning by providing an interactive environment
            for active, expressive ASL practice. Unlike traditional apps that
            focus on passive memorization, Mano uses your device's camera and a
            custom-trained machine learning model to offer real-time, corrective
            feedback on your fingerspelling, helping you build the muscle memory
            and confidence needed for real-world communication.
          </p>
        </div>

        <div className="about-section">
          <h2>About the Project</h2>
          <p>
            This application was designed and developed by Jor Lam Wong as a
            dissertation project for the MSc Software Development at the
            University of Glasgow (2025). The primary goal was to explore the
            feasibility and effectiveness of a client-side, AI-powered tutor for
            motor skill acquisition in sign language learning.
          </p>
        </div>

        <div className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack-grid">
            <div className="tech-item">
              <strong>Frontend:</strong> React, TypeScript, Vite
            </div>
            <div className="tech-item">
              <strong>Backend:</strong> Django, Django REST Framework
            </div>
            <div className="tech-item">
              <strong>Database:</strong> SQLite, PostgresSQL
            </div>
            <div className="tech-item">
              <strong>ML (Training):</strong> Python, TensorFlow, Keras,
              MediaPipe
            </div>
            <div className="tech-item">
              <strong>ML (Deployment):</strong> TensorFlow.js, MediaPipe Tasks
              Vision
            </div>
            <div className="tech-item">
              <strong>Styling:</strong> SCSS
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
