import { useEffect, useState } from "react";
import "../../styles/Settings.scss";
import type { UserInformation } from "../../models/UserInformation";
import api from "../../api";
import { Link } from "react-router-dom";
import AppearanceSettings from "../../components/settings/AppearanceSettings";
import AccountSettings from "../../components/settings/AccountSettings";
import {
  ExitIcon,
  FaceIcon,
  LockClosedIcon,
  MoonIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import SecuritySettings from "../../components/settings/SecuritySettings";

function Settings() {
  const [profile, setProfile] = useState<UserInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("account");

  const renderSection = () => {
    switch (activeSection) {
      case "appearance":
        return <AppearanceSettings />;
      case "account":
        return <AccountSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        // Pass the profile data to the AccountSettings component
        return <div>account</div>;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all to fetch both endpoints concurrently for better performance
        const [profileResponse] = await Promise.all([
          api.get("/api/user/profile/"),
        ]);
        setProfile(profileResponse.data);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  // check in case the profile data failed to load
  if (!profile) {
    return <div>Could not load profile information.</div>;
  }

  return (
    <>
      <div className="settings-layout">
        <div className="settings-sidebar">
          <div>
            <PersonIcon></PersonIcon>
            <span>{profile.username}</span>
          </div>

          <h4>Menu</h4>
          <ul>
            <li>
              <button onClick={() => setActiveSection("account")}>
                <FaceIcon />
                Account
              </button>
            </li>
            <li>
              <button onClick={() => setActiveSection("security")}>
                <LockClosedIcon></LockClosedIcon>
                Security
              </button>
            </li>

            <li>
              <button onClick={() => setActiveSection("appearance")}>
                <MoonIcon></MoonIcon>
                Appearance
              </button>
            </li>
            <li style={{ display: "flex" }}>
              <ExitIcon></ExitIcon>
              <Link to="/logout" style={{ margin: 0, padding: "0 0.2rem" }}>
                Sign out
              </Link>
            </li>
          </ul>
        </div>

        <div className="settings-content">{renderSection()}</div>
      </div>
    </>
  );
}

export default Settings;
