import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Progress from "./Progress"; // Adjust the import path as needed
import api from "../../api";

// Mock the API module
vi.mock("../../api");

describe("Profile Page", () => {
  const mockProfile = {
    username: "testuser",
    total_points: 125,
    current_streak: 5,
  };

  const mockProgress = [
    { lesson: { id: 1 } },
    { lesson: { id: 2 } },
    { lesson: { id: 3 } },
  ];

  const mockLessonCount = {
    total_lessons: 12,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 9: Displays a loading message initially
  it("displays a loading message while fetching data", () => {
    // Arrange: Mock a promise that never resolves to keep it in a loading state
    (api.get as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {})
    );

    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  // Test Case 10: Displays profile information correctly after a successful fetch
  it("displays user profile and progress correctly after data is loaded", async () => {
    // Arrange: Mock successful responses for all API calls
    (api.get as ReturnType<typeof vi.fn>).mockImplementation(
      async (url: string) => {
        if (url.includes("/api/user/profile/")) {
          return { data: mockProfile };
        }
        if (url.includes("/api/user/progress/")) {
          return { data: mockProgress };
        }
        if (url.includes("/api/lessons-total-count/")) {
          return { data: mockLessonCount };
        }
        return { data: null };
      }
    );

    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>
    );
    // Assert: Wait for the final content to appear and then check all values
    await waitFor(async () => {
      // Check that the loading message is gone
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();

      // Check that profile information is displayed
      expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
      expect(
        screen.getByText(String(mockProfile.total_points))
      ).toBeInTheDocument();
      expect(
        screen.getByText(String(mockProfile.current_streak))
      ).toBeInTheDocument();

      // CORRECTED: Use a more robust query for the "Signs Learned" card
      const signsLearnedCard = screen
        .getByText("Signs Learned")
        .closest(".right-half-card");
      expect(signsLearnedCard).toHaveTextContent(
        `${mockProgress.length} / ${mockLessonCount.total_lessons}`
      );

      // Check that the percentage is calculated and displayed correctly
      const expectedPercentage =
        (mockProgress.length / mockLessonCount.total_lessons) * 100;
      expect(screen.getByText(expectedPercentage)).toBeInTheDocument();
    });
  });

  // Test Case 11: Displays an error message if the profile fetch fails
  it("displays an error message if fetching profile data fails", async () => {
    // Arrange: Mock a failure for the profile API call
    (api.get as ReturnType<typeof vi.fn>).mockImplementation(
      async (url: string) => {
        if (url.includes("/api/user/profile/")) {
          // We can throw a generic error to simulate a network failure
          return Promise.reject(new Error("Network Error"));
        }
        // Return successful responses for others
        if (url.includes("/api/user/progress/")) {
          return { data: mockProgress };
        }
        if (url.includes("/api/lessons-total-count/")) {
          return { data: mockLessonCount };
        }
        return { data: null };
      }
    );

    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>
    );

    // Assert: Check that the error message is displayed
    // findByText will wait for the component to re-render after the error
    expect(
      await screen.findByText("Could not load profile information.")
    ).toBeInTheDocument();
  });
});
