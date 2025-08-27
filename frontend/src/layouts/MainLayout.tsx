import { type ReactNode } from "react";
import Navbar from "../components/Navbar";
import "../styles/MainLayout.scss";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout-container">
      <Navbar access="Private"></Navbar>
      <main
        style={{ backgroundColor: "var(--color-background)" }}
        className="main-content"
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
