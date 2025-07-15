import { Link } from "react-router-dom";
import "../styles/Navbar.scss"; // optional for styling if you're separating CSS

interface NavbarProps {
  access: "Private" | "Public";
}

function Navbar({ access }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          {/* <span className="logo-icon">🖐</span> */}
          <span className="logo-text">Mano</span>
        </Link>
      </div>
      <ul className="navbar-links">
        {access == "Public" ? (
          <>
            <li>
              <Link to="/about">About</Link>
            </li>

            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/login" className="btn-primary small">
                Get started
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <Link to="../">Sign-out</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
