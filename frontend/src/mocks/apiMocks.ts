import { vi } from "vitest";
import api from "../api";
import { mockUser, mockLessons, mockProgress } from "./mockData";

// A helper to ensure we are working with a mock
const mockedApiGet = api.get as ReturnType<typeof vi.fn>;

export function mockUserProfile() {
  mockedApiGet.mockImplementation(async (url: string) => {
    if (url.includes("/api/user/profile/")) {
      return Promise.resolve({ data: mockUser });
    }
    // Fallback for other URLs if needed, or let them fail
    return Promise.reject(new Error(`API call to ${url} not mocked`));
  });
}

export function mockUserProgress() {
  mockedApiGet.mockImplementation(async (url: string) => {
    if (url.includes("/api/user/progress/")) {
      return Promise.resolve({ data: mockProgress });
    }
    return Promise.reject(new Error(`API call to ${url} not mocked`));
  });
}

export function mockLesson() {
  mockedApiGet.mockImplementation(async (url: string) => {
    if (url.includes("/api/lessons/")) {
      return Promise.resolve({ data: mockLessons });
    }
    return Promise.reject(new Error(`API call to ${url} not mocked`));
  });
}

// A combined function for components that need everything
export function setupAllGetMocks() {
  vi.clearAllMocks();
  (api.get as ReturnType<typeof vi.fn>).mockImplementation(
    async (url: string) => {
      if (url.includes("/api/user/profile/")) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes("/api/user/progress/")) {
        return Promise.resolve({ data: mockProgress });
      }
      if (url.includes("/api/lessons/")) {
        return Promise.resolve({ data: mockLessons });
      }
      return Promise.resolve({ data: [] });
    }
  );
}
