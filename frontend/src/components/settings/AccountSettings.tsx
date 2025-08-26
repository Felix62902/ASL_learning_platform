import { useEffect, useState } from "react";
import api from "../../api";
import type { UserInformation } from "../../models/UserInformation";
import "../../styles/AccountSettings.scss";

function AccountSettings() {
  const [userData, setUserData] = useState<UserInformation | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/user/profile/");
        setUserData(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>Account Information</h1>
      <form>
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
          type="text"
          value={email}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email"
          id="email"
        />

        <h4>Change Password</h4>

        <label htmlFor="current password">Current password</label>
        <input
          className="input"
          type="password"
          value={Password}
          placeholder=""
          id="current password"
        />

        <label htmlFor="new password">New password</label>
        <input
          className="input"
          type="password"
          value={newPassword}
          id="new password"
        />

        <label htmlFor="confirm new password">Re-enter New password</label>
        <input
          className="input"
          type="password"
          value={confirmNewPassword}
          id="confirm new password"
        />

        <button className="form-button" type="submit">
          Save
        </button>
      </form>
    </>
  );
}

export default AccountSettings;
