import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import PracticeSession from "./PracticeSession";
import api from "../api";

// --- Mocking External Dependencies ---

// Mock the MediaPipe and TensorFlow.js models to prevent them from actually loading
vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
  HandLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue({
      detectForVideo: vi.fn().mockReturnValue({ landmarks: [] }), // Return empty landmarks by default
    }),
    HAND_CONNECTIONS: [], // Provide a dummy value
  },
  DrawingUtils: vi.fn(() => ({
    drawConnectors: vi.fn(),
    drawLandmarks: vi.fn(),
  })),
}));

vi.mock("@tensorflow/tfjs", () => ({
  loadGraphModel: vi.fn().mockResolvedValue({
    predict: vi.fn(),
  }),
  tensor2d: vi.fn(() => ({
    dispose: vi.fn(),
  })),
}));

// Mock the API module
vi.mock("../../api");

// Mock the navigate function
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ sign: "B" }), // Default to sign 'B' for testing
  };
});

describe("PracticeSession Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 1: Initial loading state
  it("displays loading messages while setting up", () => {
    render(
      <MemoryRouter>
        <PracticeSession />
      </MemoryRouter>
    );

    const loadingMessages = screen.getAllByText("Loading models...");
    expect(loadingMessages.length).toBeGreaterThanOrEqual(1); // or `.toBe(2)` if you expect exactly 2
  });

  it('disables the "Next" button if the next lesson is locked', async () => {
    // Arrange: Spy on and mock the API call
    vi.spyOn(api, "get").mockImplementation(async (url) => {
      if (url.includes("/api/unlocked-lessons")) {
        // User has only unlocked A and B
        return {
          data: [
            { lesson: { sign_name: "A" } },
            { lesson: { sign_name: "B" } },
          ],
        };
      }
      return { data: [] };
    });

    render(
      <MemoryRouter initialEntries={["/fingerspelling/practice/B"]}>
        <Routes>
          <Route
            path="/fingerspelling/practice/:sign"
            element={
              <PracticeSession
                unlockedLesson={[
                  { lesson: { sign_name: "A" } },
                  { lesson: { sign_name: "B" } },
                  { lesson: { sign_name: "C" } },
                ]}
                hasPracticedBefore={true}
                saveProgress={vi.fn()}
                lessonId={2}
                lefthanded={false}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Assert: Wait for data to load and check the button state
    await waitFor(() => {
      const nextButton = screen.getByTestId("next-button");
      // The next sign is 'C', which is NOT in the unlocked list, so the button should be disabled.
      expect(nextButton).toBeDisabled();
    });
  });
});
