import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AccountSettings from "./AccountSettings";
import api from "../../api";
import { mockUser } from "../../mocks/mockData"; // Import your mock user

// Mock the API module
vi.mock("../../api");

describe("AccountSettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the initial GET request to populate the form
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockUser });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test Case 15: Renders with initial data from the API
  it("loads and displays the user data in the form fields", async () => {
    render(<AccountSettings />);

    // Assert that the loading message appears first
    expect(screen.getByText("Loading settings...")).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue(mockUser.username.toString())
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(mockUser.email.toString())
    ).toBeInTheDocument();
  });

  // Test Case 16: Allows user to update input fields
  it("allows the user to change the value of the username and email fields", async () => {
    render(<AccountSettings />);

    // Wait for the form to populate
    const usernameInput = await screen.findByDisplayValue(
      mockUser.username.toString()
    );

    // Act: Simulate a user typing a new username
    fireEvent.change(usernameInput, { target: { value: "new_username" } });

    // Assert: Check that the input's value has been updated
    expect(usernameInput).toHaveValue("new_username");
  });

  // Test Case  17: Successfully submits updated data
  it("submits the updated data and shows a success message", async () => {
    // Arrange: Mock a successful PATCH request
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({ status: 200 });

    render(<AccountSettings />);

    const usernameInput = await screen.findByDisplayValue(
      mockUser.username.toString()
    );
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });

    // Act: Change the username and submit the form
    fireEvent.change(usernameInput, { target: { value: "updated_user" } });
    fireEvent.click(saveButton);

    // Assert
    await waitFor(() => {
      // Check that the API was called with the correct data
      expect(patchSpy).toHaveBeenCalledWith("/api/user/profile/update/", {
        username: "updated_user",
        email: mockUser.email,
        left_handed: mockUser.left_handed,
      });

      // Check that the success message appears
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });
  });

  // Test Case 18: Handles submission errors gracefully
  it("shows an alert if the profile update fails", async () => {
    // Arrange: Mock a failed PATCH request and spy on the window.alert function
    vi.spyOn(api, "patch").mockRejectedValue(new Error("Update failed"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {}); // Mock alert to prevent it from blocking the test

    render(<AccountSettings />);

    const saveButton = await screen.findByRole("button", {
      name: /Save Changes/i,
    });

    // Act: Submit the form
    fireEvent.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "An error occurred while updating your profile."
      );
    });
  });
});
