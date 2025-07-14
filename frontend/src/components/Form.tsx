import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

interface FormProps {
  route: string;
  method: "Register" | "Login";
}

function Form({ route, method }: FormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    if (method === "Register" && password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      if (method === "Login") {
        const userData = {
          email,
          password,
        };

        const res = await api.post(route, userData);
        // If login, store tokens and navigate to home
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/home");
      } else {
        const userData = {
          username,
          email,
          password,
        };

        const res = await api.post(route, userData);
        // If register, navigate to the login page
        navigate("/login");
      }
    } catch (error) {
      alert(error); // Replace with a more user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {/* Title */}
      <h1>{method}</h1>
      {/* Text description */}
      {method == "Register" ? (
        <p className="subtitle">Register to get started now</p>
      ) : (
        <p className="subtitle">Login to get started</p>
      )}
      <div className="input-container">
        {/* Username */}
        {method == "Register" && (
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        )}

        {/* Email */}
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        {/* Password */}
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {/* Confirm Password */}
        {method == "Register" && (
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
        )}
      </div>
      {/* Submit Button */}
      <button className="form-button" type="submit">
        Sign {method == "Register" ? <span>Up</span> : <span>In</span>}
      </button>
      {/* Reroute to login/ Signup */}
      {method == "Register" ? (
        <p className="form-reroute">
          Already registered? <Link to="/login">Login</Link>
        </p>
      ) : (
        <p className="form-reroute">
          Don't have an account? <Link to="/register">Register Here</Link>
        </p>
      )}
      {method == "Login" && (
        <Link to="/reset_password" className="password_reset">
          Forgot your password?
        </Link>
      )}
    </form>
  );
}

export default Form;
