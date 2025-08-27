// practice screen for both the fingerspelling and freepractice

import { useEffect, useState } from "react";
import PracticeSession from "../../components/PracticeSession";
import Navbar from "../../components/Navbar";
import api from "../../api";
import { useParams } from "react-router-dom";
import type { ProgressRecord } from "../../models/ProgressRecord";
import type { UserInformation } from "../../models/UserInformation";

interface UnlockedLesson {
  id: number;
  lesson: {
    sign_name: string;
  };
}

function PracticeAlpha() {
  const { sign } = useParams();
  const [unlockedLesson, setUnlockedLessons] = useState<string[]>([]); // check whether lesson is unlocked by user
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [hasPracticedBefore, setHasPracticedBefore] = useState(true); // Assume practiced until proven otherwise
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInformation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          unlockedLessonsResponse,
          progressResponse,
          lessonsResponse,
          profileResponse,
        ] = await Promise.all([
          api.get("/api/unlocked-lessons/"),
          api.get("/api/user/progress/"),
          api.get("/api/lessons/?category_name=fingerspelling"),
          api.get("/api/user/profile/"),
        ]);
        setUser(profileResponse.data);
        const unlockedNames = unlockedLessonsResponse.data.map(
          (item: UnlockedLesson) => item.lesson.sign_name.toUpperCase()
        );
        setUnlockedLessons(unlockedNames);
        console.log("Unlocked lessons:", unlockedNames);

        const currentLesson = lessonsResponse.data.find(
          (l: any) => l.sign_name.toUpperCase() === sign?.toUpperCase()
        );
        if (currentLesson) {
          setLessonId(currentLesson.id);
        }

        // Check if there's a progress record for this specific lesson
        const practiced = progressResponse.data.some(
          (record: ProgressRecord) => record.lesson.id === currentLesson?.id
        );
        setHasPracticedBefore(practiced);
        if (!practiced) {
          console.log("This is the first time practicing this lesson!");
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sign]);

  const saveProgress = async () => {
    console.log(
      `First time correct for lesson ${lessonId}! Awarding points...`
    );
    try {
      await api.post(`/api/progress/lesson/${lessonId}/`);
      // After successfully saving, mark it as practiced to prevent future API calls
      setHasPracticedBefore(true);
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  return (
    <>
      <div>
        <Navbar access="Private"></Navbar>
        {!loading && lessonId !== null && user && (
          <PracticeSession
            unlockedLesson={unlockedLesson}
            hasPracticedBefore={hasPracticedBefore}
            saveProgress={saveProgress}
            lessonId={lessonId}
            lefthanded={user.left_handed}
          />
        )}
      </div>
    </>
  );
}

export default PracticeAlpha;
