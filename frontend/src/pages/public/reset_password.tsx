import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/recover.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  return (
    <div className="password-reset-layout">
      <form className="password-reset-box">
        <h1>Recover Password</h1>
        <p>
          Enter the password associated with your account and we will send you
          password reset instructions
        </p>
        <label>Email address</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@address.com"
          required
        />
        <button disabled className="btn" type="submit">
          Request reset link
        </button>
        <Link to="/login">Return to Sign In</Link>
      </form>
    </div>
  );
}

export default ResetPassword;
