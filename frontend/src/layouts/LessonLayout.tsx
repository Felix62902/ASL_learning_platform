import { useEffect, useState } from "react";
import "../styles/Lesson.scss";
import { useNavigate } from "react-router-dom";
import api from "../api";
import type { UserInformation } from "../models/UserInformation";
import type { ProgressRecord } from "../models/ProgressRecord";

export interface LessonContentItem {
  sign_name: string;
  description: string;
  unlock_cost: number;
  completion_points: number;
}

interface LessonLayoutProps {
  title: string;
  description: string;
  content: LessonContentItem[]; // list of dict
}

function LessonLayout({ title, description, content }: LessonLayoutProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<UserInformation | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [lesson, setLesson] = useState<LessonContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all to fetch both endpoints concurrently for better performance
        const [profileResponse, progressResponse, lessonResponse] =
          await Promise.all([
            api.get("/api/user/profile/"),
            api.get("/api/user/progress/"),
            await api.get("/api/lessons/?category_name=fingerspelling"),
          ]);

        setUser(profileResponse.data);
        setProgress(progressResponse.data);
        setLesson(lessonResponse.data);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredContent = content.filter((item) =>
    item.sign_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let navigate = useNavigate();

  const toPractce = (sign: string) => {
    let path = `/fingerspelling/practice/${sign}`;
    navigate(path);
  };

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div className="title-and-searchbar">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <input
          className="searchbar"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="lessons-container">
        {/* .map() to loop over the content array */}
        {filteredContent.map((item, index) =>
          user!.total_points >= item.unlock_cost ? (
            <div className="lesson-card" key={index}>
              <img
                src={`/assets/images/Sign_language_${item.sign_name}.svg`}
                alt="ASL sign"
                className="sign-image"
                style={{
                  transform: user!.left_handed ? "scaleX(-1)" : "none",
                }}
              />

              <h3>{item.sign_name}</h3>
              <p>{item.description}</p>
              <button
                className="lesson-btn"
                onClick={() => toPractce(item.sign_name)}
              >
                Practice →
              </button>
            </div>
          ) : (
            <div className="lesson-card locked" key={index}>
              <img src={"/assets/images/locked.svg"} className="sign-image" />
              <h3>Lesson</h3>
              <p>
                Earn {item?.unlock_cost - user!.total_points} more points to
                unlock
              </p>
              <button className="lesson-btn" disabled>
                Locked →
              </button>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default LessonLayout;
