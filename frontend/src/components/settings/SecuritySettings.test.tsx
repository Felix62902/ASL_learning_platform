// FILE: src/components/settings/SecuritySettings.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SecuritySettings from "./SecuritySettings";
import api from "../../api";

// Mock the API module to prevent real network calls
vi.mock("../../api");

describe("SecuritySettings Component", () => {
  beforeEach(() => {
    // Clear any previous mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });

  // Test Case 1: Renders the form correctly
  it("renders the change password form with all fields", () => {
    render(<SecuritySettings />);

    // Assert that all input fields are present, using their labels to find them
    expect(screen.getByLabelText(/Current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New password$/i)).toBeInTheDocument(); // Use exact match
    expect(screen.getByLabelText(/Re-enter new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Changes/i })
    ).toBeInTheDocument();
  });

  // Test Case 2: Client-side validation for mismatched new passwords
  it("displays an error if the new passwords do not match", async () => {
    render(<SecuritySettings />);

    // Act: Fill the form with mismatched new passwords
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "oldPassword123" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newPassword123" },
    }); // Use exact match
    fireEvent.change(screen.getByLabelText(/Re-enter new password/i), {
      target: { value: "newPassword456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    // Assert: Check that the specific error message is displayed
    expect(
      await screen.findByText("New passwords do not match.")
    ).toBeInTheDocument();
  });

  // Test Case 3: Client-side validation for same old and new password
  it("displays an error if the new password is the same as the old password", async () => {
    render(<SecuritySettings />);

    // Act: Fill the form with the same password for old and new
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "password123" },
    }); // Use exact match
    fireEvent.change(screen.getByLabelText(/Re-enter new password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    // Assert
    expect(
      await screen.findByText(
        "New password must be different from the old password."
      )
    ).toBeInTheDocument();
  });

  // Test Case 4: Successful password change
  it("submits the form and displays a success message on successful update", async () => {
    // Arrange: Mock a successful API response
    const putSpy = vi.spyOn(api, "put").mockResolvedValue({ status: 200 });

    render(<SecuritySettings />);

    const oldPasswordInput = screen.getByLabelText(/Current password/i);
    const newPasswordInput = screen.getByLabelText(/^New password$/i); // Use exact match
    const confirmPasswordInput = screen.getByLabelText(
      /Re-enter new password/i
    );
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });

    // Act: Fill the form correctly and submit
    fireEvent.change(oldPasswordInput, { target: { value: "oldPassword123" } });
    fireEvent.change(newPasswordInput, { target: { value: "newPassword123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "newPassword123" },
    });
    fireEvent.click(saveButton);

    // Assert
    await waitFor(() => {
      // Check that the API was called with the correct data
      expect(putSpy).toHaveBeenCalledWith("/api/user/change-password/", {
        old_password: "oldPassword123",
        new_password: "newPassword123",
      });
      // Check that the success message appears
      expect(
        screen.getByText("Password updated successfully!")
      ).toBeInTheDocument();
    });

    // Bonus Assert: Check that the form fields were cleared on success
    expect(oldPasswordInput).toHaveValue("");
    expect(newPasswordInput).toHaveValue("");
    expect(confirmPasswordInput).toHaveValue("");
  });

  // Test Case 5: Failed password change (e.g., incorrect old password)
  it("displays a backend error message if the update fails", async () => {
    // Arrange: Mock a failed API response from the backend
    vi.spyOn(api, "put").mockRejectedValue({
      response: {
        data: {
          old_password: [
            "Your old password was entered incorrectly. Please enter it again.",
          ],
        },
      },
    });

    render(<SecuritySettings />);

    // Act: Fill form and submit
    fireEvent.change(screen.getByLabelText(/Current password/i), {
      target: { value: "wrongOldPassword" },
    });
    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: "newPassword123" },
    }); // Use exact match
    fireEvent.change(screen.getByLabelText(/Re-enter new password/i), {
      target: { value: "newPassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    // Assert: Check that the specific error from the backend is shown
    expect(
      await screen.findByText(
        "Your old password was entered incorrectly. Please enter it again."
      )
    ).toBeInTheDocument();
  });
});
