import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Form from "./Form"; // Adjust the import path as needed
import api from "../api";

// Mock the useNavigate hook
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    Link: (props: any) => <a {...props}>{props.children}</a>, // Mock Link for simplicity
  };
});

describe("Form Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  // ID4 : Successful Login
  it("handles successful login and navigates to home", async () => {
    // Mock the API response
    const postSpy = vi.spyOn(api, "post").mockResolvedValue({
      data: {
        access: "fake_access_token",
        refresh: "fake_refresh_token",
      },
    });

    render(
      <MemoryRouter>
        <Form route="/api/token/" method="Login" />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.submit(screen.getByTestId("login-form"));

    // Verify all expected outcomes
    await waitFor(() => {
      // 1. Verify API was called with correct data
      expect(postSpy).toHaveBeenCalledWith("/api/token/", {
        email: "test@test.com",
        password: "password123",
      });

      // 3. Verify navigation occurred
      expect(mockedNavigate).toHaveBeenCalledWith("/home");
    });
  });

  // ID 5: Failed Login (Incorrect Credentials)
  it("displays an error message for incorrect credentials (401 error)", async () => {
    // Arrange: Mock a 401 Unauthorized error response
    vi.spyOn(api, "post").mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { detail: "No active account found with the given credentials" },
      },
    });

    render(
      <MemoryRouter>
        <Form route="/api/token/" method="Login" />
      </MemoryRouter>
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    // Assert: Check that the specific error message is displayed
    expect(
      await screen.findByText("Incorrect email or password. Please try again.")
    ).toBeInTheDocument();
  });

  // Test 6: Failed Login (Network Error)
  it("displays a network error message when the server is unreachable", async () => {
    // Mock a network error
    vi.spyOn(api, "post").mockRejectedValue({
      isAxiosError: true,
      request: {}, // Simulates request made but no response
    });

    render(
      <MemoryRouter>
        <Form route="/api/token/" method="Login" />
      </MemoryRouter>
    );

    // Fill and submit form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    // Assert the complete network error message appears
    expect(
      await screen.findByText(
        "Could not connect to the server. Please check your internet connection and try again."
      )
    ).toBeInTheDocument();
  });

  //   Test ID 7 : Failed Registration (Password Mismatch)
  it('displays a "Passwords do not match!" error on registration form', async () => {
    render(
      <MemoryRouter>
        <Form route="/api/user/register/" method="Register" />
      </MemoryRouter>
    );
    // Act: Enter mismatched passwords
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    // Assert
    expect(
      await screen.findByText("Passwords do not match!")
    ).toBeInTheDocument();
  });

  // Test Case 8: Failed Registration (Username already exists)
  it("displays an error message when the username already exists", async () => {
    // Arrange: Mock a 400 Bad Request error for a duplicate username
    vi.spyOn(api, "post").mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { username: ["A user with that username already exists."] },
      },
    });

    render(
      <MemoryRouter>
        <Form route="/api/user/register/" method="Register" />
      </MemoryRouter>
    );

    // Act: Fill out the form with valid, matching passwords
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "existinguser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    // Assert: Check that the specific error message from the backend is displayed
    expect(
      await screen.findByText("A user with that username already exists.")
    ).toBeInTheDocument();
  });
});
