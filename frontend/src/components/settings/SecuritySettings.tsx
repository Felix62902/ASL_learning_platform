import { useState, type FormEvent } from "react";
import api from "../../api";
import "../../styles/AccountSettings.scss";

function SecuritySettings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    //  Add validation checks
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      setLoading(false);
      return;
    }
    if (oldPassword === newPassword) {
      setErrorMessage("New password must be different from the old password.");
      setLoading(false);
      return;
    }

    try {
      //  data payload
      const data = {
        old_password: oldPassword,
        new_password: newPassword,
      };

      //  Send a PUT request to  endpoint
      const response = await api.put("/api/user/change-password/", data);

      if (response.status === 200) {
        setSuccessMessage("Password updated successfully!");
        // Clear the form fields on success
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        // Display specific error from the backend
        const errorData = error.response.data;
        const firstErrorKey = Object.keys(errorData)[0];
        setErrorMessage(errorData[firstErrorKey][0]);
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Login & Security</h1>
      <h4>Change your password here.</h4>

      <form onSubmit={handleSubmit}>
        <label htmlFor="current-password">Current password</label>
        <input
          className="input"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          id="current-password"
        />

        <label htmlFor="new-password">New password</label>
        <input
          className="input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          id="new-password"
        />

        <label htmlFor="confirm-new-password">Re-enter new password</label>
        <input
          className="input"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          id="confirm-new-password"
        />

        <button className="form-button" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && (
          <p className="error-message" style={{ color: "red" }}>
            {errorMessage}
          </p>
        )}
      </form>
    </>
  );
}

export default SecuritySettings;
