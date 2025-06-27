import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import * as tmImage from '@teachablemachine/image';

@Component({
  selector: 'app-teachable-machine',
  templateUrl: './teachable-machine.component.html',
  styleUrls: ['./teachable-machine.component.scss']
})
export class TeachableMachineComponent implements AfterViewInit, OnDestroy {
  // Get a reference to the #webcamContainer element from the HTML
  @ViewChild('webcamContainer') webcamContainer!: ElementRef;

  // Model and webcam state variables 
  model: tmImage.CustomMobileNet | null = null; // holds the machine learning model once loaded
  webcam: tmImage.Webcam | null = null;
  maxPredictions: number = 0;
  private animationFrameId: number | null = null;

  // State for the UI
  isLoading = false;
  isReady = false;

  // Responsible for holding the list of predictions the machine learning model generates
  predictions: { className: string, probability: number }[] = [];

  constructor() { }

  // This lifecycle hook runs after the view (HTML) has been initialized
  ngAfterViewInit(): void {
    // Component is ready, but  wait for the user to click "Start"
  }

// loads ML mode, request user's webcam access, connect webcam to HTML, start prediction loop, manage UI state
  async init(): Promise<void> {
    this.isLoading = true;
    this.isReady = false;

    try { 
      const URL = 'assets/ML_model/';
      const modelURL = URL + 'model.json';
      const metadataURL = URL + 'metadata.json';

      // Log the paths to make sure they are correct
      console.log('Attempting to load model from:', modelURL);

      // Load the model and metadata
      this.model = await tmImage.load(modelURL, metadataURL); // pause function execution until tmImage promise is fulfilled
      this.maxPredictions = this.model.getTotalClasses();

      console.log('Model loaded successfully. Setting up webcam...');

      // Setup the webcam
      const flip = true;
      this.webcam = new tmImage.Webcam(200, 200, flip);
      await this.webcam.setup(); // request access to the webcam, puase until user Allow or throw error if user click Block
      await this.webcam.play();

      console.log('Webcam setup complete. Starting loop.');

      this.isLoading = false;
      this.isReady = true;

      // Append the webcam as a child DOM element to the HTML
      this.webcamContainer.nativeElement.appendChild(this.webcam.canvas);

      this.predictions = Array.from({ length: this.maxPredictions }, () => ({ className: '', probability: 0 }));

      this.animationFrameId = window.requestAnimationFrame(() => this.loop()); // start prediction loop, execute loop for every frame and store return ID in requestAnimationFrameID

    } catch (error) {
      this.isLoading = false; // Turn off the loading message
      console.error('Error initializing Teachable Machine:', error);
      alert('Failed to load model or start webcam. Please check the developer console (F12) for more details.');
    }
  }

  // The main prediction loop
  async loop(): Promise<void> {
    if (this.webcam) {
      this.webcam.update(); // command from TM, capture latest webcam frame and draw onto its internal <canvas>
      await this.predict(); // wait until model finish prediction and updating on screen
      this.animationFrameId = window.requestAnimationFrame(() => this.loop()); // browser API, repeat loop when ready
    }
  }
  
  // Run the prediction. Takes webcam frame, feed it to model and update compoment state with result
  async predict(): Promise<void> {
    if (this.model && this.webcam) {
      const prediction = await this.model.predict(this.webcam.canvas);
      // Update the predictions array for the Angular template to display
      this.predictions = prediction.map(p => ({
        className: p.className,
        probability: p.probability
      }));
    }
  }

  // This lifecycle hook runs when the component is about to be destroyed
  ngOnDestroy(): void {
    // Stop the webcam and cancel the animation frame to prevent memory leaks
    if (this.webcam) {
      this.webcam.stop();
    }
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
  }
}