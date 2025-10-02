import { Link } from "react-router-dom";
import "../styles/Navbar.scss"; // optional for styling if you're separating CSS
import { ExitIcon } from "@radix-ui/react-icons";

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
            <li className="public-nav">
              <Link to="/about">About</Link>
            </li>

            <li className="public-nav">
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
              <Link to="/progress">Progress</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <ExitIcon className="nav-icon"></ExitIcon>
              <Link to="../">Sign-out</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
