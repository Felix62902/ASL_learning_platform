import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";

// Define the shape of the context's value
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define the props for the provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // State to hold the current theme. Default to 'light'.
  // You could also check localStorage here to remember the user's preference.
  const [theme, setTheme] = useState("light");

  // This effect runs whenever the `theme` state changes
  useEffect(() => {
    const body = window.document.body;
    body.classList.remove("light", "dark"); // Remove any existing theme class
    body.classList.add(theme); // Add the new theme class
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily use the theme context in any component
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
