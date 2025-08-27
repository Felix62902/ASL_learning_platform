import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LessonLayout, { type LessonContentItem } from "./LessonLayout";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";

import { mockLessons } from "../mocks/mockData";
import { setupAllGetMocks } from "../mocks/apiMocks";

// Mock the useNavigate hook
const mockedNavigate = vi.fn();
// CORRECTED: Use Vitest's async mocking pattern
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock the entire api module
vi.mock("../api");

describe("LessonLayout Component", () => {
  beforeEach(() => {
    // Call the centralized setup function before each test
    setupAllGetMocks();
  });

  //  TEST ID 1: Search Bar funcions correctly by filtering out results
  it("filters the lesson cards correctly when a user types in the search bar", async () => {
    render(
      <MemoryRouter>
        <LessonLayout
          title="Test Lessons"
          description="Test description"
          content={mockLessons}
        ></LessonLayout>
      </MemoryRouter>
    );

    // test if the lesson card appears
    // ensure all async operations in useEffect complete
    await waitFor(async () => {
      // Wait for the component to finish loading and render the initial cards
      expect(await screen.findByText("A")).toBeInTheDocument();
    });
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();

    // find searchbar and simulate typing "A"
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "A" } });

    // cards for 'A' should still be on the screen, B should not be
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
  });

  // Test ID 2: Lesson Cards load correctly
  it("Lesson cards displays correctly when the component was initially loaded", async () => {
    render(
      <MemoryRouter>
        <LessonLayout
          title="Test Lessons"
          description="Test description"
          content={mockLessons}
        ></LessonLayout>
      </MemoryRouter>
    );

    //await component to finish internal loading
    await waitFor(async () => {
      expect(
        await screen.findByText(mockLessons[0].sign_name)
      ).toBeInTheDocument();
    });

    for (const item of mockLessons.slice(0, 6)) {
      expect(await screen.findByText(item.sign_name)).toBeInTheDocument();
    }
  });

  // Test ID 3 Make sure some lessons are locked if user does not have enough points
  it("displays a locked state for lessons the user cannot afford", async () => {
    // For this test, override the default mock to return a user with fewer points
    render(
      <MemoryRouter>
        <LessonLayout
          title="Test Lessons"
          description="Test description"
          content={mockLessons}
        />
      </MemoryRouter>
    );

    // Lesson "G" costs 100 points. Our user only has 75.
    const lockedLesson = mockLessons.find((lesson) => lesson.sign_name === "J");
    if (!lockedLesson) throw new Error("Lesson J not found in mock data");

    // VERIFY the lesson name ("F") is NOT visible because it's locked.
    expect(screen.queryByText(lockedLesson.sign_name)).not.toBeInTheDocument();

    // 2. VERIFY a locked indicator IS visible.
    // This assumes the locked card displays the point cost.
    // This might need to be changed to find a lock icon, e.g., screen.findByTestId("lock-icon-F")
    const pointCostElement = await screen.findByText(
      "Earn 85 more points to unlock"
    );
    expect(pointCostElement).toBeInTheDocument();
  });
});
