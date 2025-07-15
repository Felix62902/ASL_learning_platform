import { type ReactNode } from "react";
import Navbar from "../components/Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Navbar access="Private"></Navbar>
      <main
        style={{
          maxWidth: "80%",
          margin: "0 auto",
          padding: "0 2rem",
          fontFamily: "var(--fontstyle)",
          // backgroundColor: "red",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
