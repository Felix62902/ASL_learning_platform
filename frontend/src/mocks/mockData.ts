import type { UserInformation } from "../models/UserInformation";
import type { LessonContentItem } from "../layouts/LessonLayout";
import type { ProgressRecord } from "../models/ProgressRecord";

export const mockUser: UserInformation = {
  id: 1,
  username: "testuser",
  email: "test@test.com",
  total_points: 75,
  current_streak: 1,
  left_handed: false,
};

export const mockLessons: LessonContentItem[] = [
  {
    sign_name: "A",
    description: "The first letter.",
    unlock_cost: 0,
    completion_points: 10,
  },
  {
    sign_name: "B",
    description: "The second letter.",
    unlock_cost: 0,
    completion_points: 10,
  },
  {
    sign_name: "C",
    description: "The third letter.",
    unlock_cost: 0,
    completion_points: 10,
  },
  {
    sign_name: "D",
    description: "The fourth letter.",
    unlock_cost: 25,
    completion_points: 10,
  },
  {
    sign_name: "E",
    description: "The fifth letter.",
    unlock_cost: 50,
    completion_points: 10,
  },
  {
    sign_name: "F",
    description: "The sixth letter.",
    unlock_cost: 75,
    completion_points: 10,
  },
  {
    sign_name: "G",
    description: "The seventh letter.",
    unlock_cost: 100,
    completion_points: 15,
  },
  {
    sign_name: "H",
    description: "The eighth letter.",
    unlock_cost: 120,
    completion_points: 15,
  },
  {
    sign_name: "I",
    description: "The ninth letter.",
    unlock_cost: 140,
    completion_points: 15,
  },
  {
    sign_name: "J",
    description: "The tenth letter.",
    unlock_cost: 160,
    completion_points: 20,
  },
  {
    sign_name: "Apple",
    description: "A fruit",
    unlock_cost: 20,
    completion_points: 20,
  },
];

export const mockProgress: ProgressRecord[] = [
  {
    id: 1,
    lesson: { id: 1, sign_name: "A" },
    last_practiced_at: new Date("2025-07-30T10:00:00Z").toISOString(),
  },
  {
    id: 2,
    lesson: { id: 2, sign_name: "B" },
    last_practiced_at: new Date("2025-07-31T11:00:00Z").toISOString(),
  },
  {
    id: 3,
    lesson: { id: 3, sign_name: "C" },
    last_practiced_at: new Date("2025-08-01T09:30:00Z").toISOString(),
  },
];
