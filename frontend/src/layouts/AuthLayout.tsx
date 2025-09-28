import type { ReactNode } from "react";
import "../styles/Auth.scss";

interface AuthLayoutProps {
  imagePosition: "left" | "right";
  children: ReactNode;
}

function AuthLayout({ imagePosition, children }: AuthLayoutProps) {
  // Conditionally add the 'image-right' class to the parent grid
  const layoutClass = `AuthLayout-grid ${
    imagePosition === "right" ? "image-right" : "image-left"
  }`;

  return (
    <div className={layoutClass}>
      <div className="image-column">
        <div>
          <img src="/assets/images/logo.png" alt="Mano Logo"></img>
        </div>
      </div>
      <div className="form-column">{children}</div>
    </div>
  );
}

export default AuthLayout;
