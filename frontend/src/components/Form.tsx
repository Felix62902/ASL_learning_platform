import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import type { AxiosError } from "axios";

interface FormProps {
  route: string;
  method: "Register" | "Login";
}

function Form({ route, method }: FormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLeftHanded, setIsLeftHanded] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(""); // Clear previous errors on a new submission
    e.preventDefault();

    if (method === "Register" && password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const userData =
        method === "Login"
          ? { email, password }
          : { username, email, password, left_handed: isLeftHanded };

      const res = await api.post(route, userData);

      if (method === "Login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/home");
      } else {
        navigate("/login");
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (axiosError.response.status === 400 && method == "Login") {
          setError("Incorrect email or password. Please try again.");
        } else {
          // Handle other server errors (e.g., 400 for bad data on register)
          const errorData = axiosError.response.data as any;
          const errorMessage = Object.values(errorData).join(" ");
          setError(errorMessage || "An error occurred. Please try again.");
        }
      } else if (axiosError.request) {
        // The request was made but no response was received (e.g., 504 timeout)
        setError(
          "Could not connect to the server. Please check your internet connection and try again."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-container"
      data-testid="login-form"
    >
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

      {/* lefthanded? */}
      {method === "Register" && (
        <div className="input-wrapper">
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
      )}
      {error && (
        <p style={{ color: "red" }} className="error-message">
          {error}
        </p>
      )}

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
