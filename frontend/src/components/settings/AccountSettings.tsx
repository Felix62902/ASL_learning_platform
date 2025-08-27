import { useEffect, useState, type FormEvent } from "react";
import api from "../../api";
import type { UserInformation } from "../../models/UserInformation";
import "../../styles/AccountSettings.scss";

function AccountSettings() {
  const [userData, setUserData] = useState<UserInformation | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [isLeftHanded, setIsLeftHanded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/user/profile/");
        setUserData(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
        setIsLeftHanded(response.data.left_handed);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(""); // Clear previous messages

    try {
      //  use a PATCH request to send only the fields that can be changed
      const updatedData = {
        username,
        email,
        left_handed: isLeftHanded,
      };

      const response = await api.patch(
        "/api/user/profile/update/",
        updatedData
      );

      if (response.status === 200) {
        setSuccessMessage("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("An error occurred while updating your profile.");
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <>
      <h1>Account Information</h1>
      <h4 style={{ color: "var(--color-text-secondary)" }}>
        Change your Username, Email address, and preferred hand here.
      </h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          className="input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          id="username"
        />

        <label htmlFor="email">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email"
          id="email"
        />

        <div className="input-wrapper" style={{ marginTop: "2rem" }}>
          <input
            type="checkbox"
            id="toggle"
            className="toggleCheckbox"
            checked={!isLeftHanded}
            onChange={(e) => setIsLeftHanded(!e.target.checked)}
          />
          <label htmlFor="toggle" className="toggleContainer">
            <div>Left Handed </div>
            <div>Right Handed</div>
          </label>
        </div>

        <button className="form-button" type="submit">
          Save Changes
        </button>

        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </>
  );
}

export default AccountSettings;
