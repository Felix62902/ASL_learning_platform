import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Settings from "./Settings";
import api from "../../api";
import { mockUser } from "../../mocks/mockData";

//  replaces the module path with a simple div
vi.mock("../../components/settings/AppearanceSettings", () => ({
  default: () => <div>Appearance Settings Component</div>,
}));
vi.mock("../../components/settings/AccountSettings", () => ({
  default: () => <div>Account Settings Component</div>,
}));
vi.mock("../../components/settings/SecuritySettings", () => ({
  default: () => <div>Security Settings Component</div>,
}));

// Mock the react-router-dom hooks, specifically overriding the useNavigate, and change <Link> to <a>
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    Link: (props: any) => <a {...props}>{props.children}</a>,
  };
});

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // clear all mock data and ensure one does not affect another ( test isolation )
    vi.spyOn(api, "get").mockResolvedValue({ data: mockUser }); // intercept and mocks the api.get method, return a resolved promise in the form of fake user data
  });

  afterEach(() => {
    // Restore all mocks functions and modules to originao unmocked state after each test to prevent test leakage
    vi.restoreAllMocks();
  });

  // Test Case 12: Initial Render, verify account section is shown by default and other sections are not visible
  it("renders correctly and shows the Account section by default", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    // Wait for the profile data to load and the component to render
    await waitFor(async () => {
      expect(
        await screen.findByText("Account Settings Component")
      ).toBeInTheDocument();
    });

    // Check that the other sections are not visible
    expect(
      screen.queryByText("Appearance Settings Component")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Security Settings Component")
    ).not.toBeInTheDocument();
  });

  // Test Case 13: Switching to the Security Section
  it("switches to the Security section when the security button is clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    // Wait for the initial render
    await waitFor(async () => {
      expect(
        await screen.findByText("Account Settings Component")
      ).toBeInTheDocument();
    });

    // Find and click the "Security" button
    const securityButton = screen.getByRole("button", { name: /Security/i });
    fireEvent.click(securityButton);

    // Assert: Check that the Security component is now visible
    expect(
      await screen.findByText("Security Settings Component")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Account Settings Component")
    ).not.toBeInTheDocument();
  });

  // Test Case 14: Switching to the Appearance Section
  it("switches to the Appearance section when the appearance button is clicked", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    // Wait for the initial render
    await waitFor(async () => {
      expect(
        await screen.findByText("Account Settings Component")
      ).toBeInTheDocument();
    });

    // Act: Find and click the "Appearance" button
    const appearanceButton = screen.getByRole("button", {
      name: /Appearance/i,
    });
    fireEvent.click(appearanceButton);

    // Assert: Check that the Appearance component is now visible
    expect(
      await screen.findByText("Appearance Settings Component")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Account Settings Component")
    ).not.toBeInTheDocument();
  });
});
