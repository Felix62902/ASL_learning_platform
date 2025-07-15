import { Link } from "react-router-dom";
import "../../styles/Progress.scss";
import { useEffect, useState } from "react";
import api from "../../api";

interface UserInformation {
  username: String;
  total_points: number;
  current_streak: number;
}

interface ProgressRecord {
  id: number;
  lesson: {
    id: number;
    sign_name: string;
    // ... other lesson fields
  };
  last_practiced_at: string; // API sends dates as strings
}

function Profile() {
  const [profile, setProfile] = useState<UserInformation | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [lessonCount, setLessonCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all to fetch both endpoints concurrently for better performance
        const [profileResponse, progressResponse, lessonCountResponse] =
          await Promise.all([
            api.get("/api/user/profile/"),
            api.get("/api/user/progress/"), // Corrected URL with leading slash
            api.get("/api/lessons-total-count/"),
          ]);

        setProfile(profileResponse.data);
        setProgress(progressResponse.data);
        setLessonCount(lessonCountResponse.data.total_lessons);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const percentageComplete = parseFloat(
    ((progress.length / lessonCount) * 100).toFixed(2)
  );

  // Add a loading state to prevent errors
  if (loading) {
    return <div>Loading profile...</div>;
  }

  // check in case the profile data failed to load
  if (!profile) {
    return <div>Could not load profile information.</div>;
  }

  return (
    <>
      <div className="title-container">
        <h1>Progress</h1>
        <p>
          Welcome back, {profile.username}! Here's a summary of your learning
          journey and achievements so far.
        </p>
      </div>

      <div className="profile-main-container">
        <div className="profile-container">
          <h3>Profile</h3>
          <h1>{profile.username}</h1>
          <Link to=""></Link>
        </div>

        <div className="righthalf-container">
          <div className="right-half-card">
            <div className="card-subheader">Progress</div>
            <p>Percentage of signs completed</p>
            <div className="card-header">
              {percentageComplete}
              <span style={{ color: "var(--color-text-secondary" }}>%</span>
            </div>
          </div>
          <div className="right-half-card">
            <div className="card-subheader">Total Points</div>
            <div className="card-header">{profile.total_points}</div>
          </div>
          <div className="right-half-card">
            <div className="card-subheader">Signs Learned</div>
            <div className="card-header">
              {progress.length} /{" "}
              <span style={{ color: "var(--color-text-secondary" }}>
                {lessonCount}
              </span>
            </div>
          </div>
          <div className="right-half-card">
            <div className="card-subheader">Streak</div>
            <div className="card-header">{profile.current_streak}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
