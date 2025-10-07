import { useEffect, useState } from "react";
import "../../styles/Settings.scss";
import type { UserInformation } from "../../models/UserInformation";
import api from "../../api";
import { Link } from "react-router-dom";
import AppearanceSettings from "../../components/settings/AppearanceSettings";
import AccountSettings from "../../components/settings/AccountSettings";
import {
  Cross1Icon,
  ExitIcon,
  FaceIcon,
  HamburgerMenuIcon,
  LockClosedIcon,
  MoonIcon,
  PersonIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import SecuritySettings from "../../components/settings/SecuritySettings";

function Settings() {
  const [profile, setProfile] = useState<UserInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("account");
  const [isSidebarOpen, setIsSideBarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSideBarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSideBarOpen(false);
  };

  const handleSectionChange = (section: any) => {
    setActiveSection(section);
    closeSidebar(); // Close sidebar when a section is selected on mobile
  };

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
    // closeSidebar();
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
        {/* Overlay */}
        <div
          className={`sidebar-overlay ${
            isSidebarOpen ? "overlay-visible" : ""
          }`}
          onClick={closeSidebar}
        />

        {/* Sidebar */}
        <div
          className={`settings-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}
        >
          {/* Mobile close button */}
          <button className="mobile-menu-toggle" onClick={toggleSidebar}>
            <Cross1Icon />
          </button>

          <div>
            <PersonIcon />
            <span>{profile.username}</span>
          </div>

          <h4>Menu</h4>
          <ul>
            <li>
              <button onClick={() => handleSectionChange("account")}>
                <FaceIcon />
                <span>Account</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSectionChange("security")}>
                <LockClosedIcon />
                <span>Security</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSectionChange("appearance")}>
                <MoonIcon />
                <span>Appearance</span>
              </button>
            </li>
            <li style={{ display: "flex" }}>
              <ExitIcon />
              <Link to="/logout" style={{ margin: 0, padding: "0 0.2rem" }}>
                <span>Sign out</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="settings-content">
          {/* Mobile menu button */}
          <button className="mobile-menu-button" onClick={toggleSidebar}>
            <HamburgerMenuIcon />
            <span>Menu</span>
          </button>

          {renderSection()}
        </div>
      </div>
    </>
  );
}

export default Settings;
