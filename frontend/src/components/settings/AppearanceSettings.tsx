import { useTheme } from "../../ThemeContext";
import ToggleSwitch from "../ToggleSwitch"; // Import the new component

export default function AppearanceSettings() {
  // Get theme data directly from the context using the custom hook
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <h2>Appearance</h2>
      <p>Customize the look and feel of the application.</p>
      <div className="setting-option">
        <span>Dark Mode</span>

        {/*
          This is the corrected usage.
          - `isOn` is set based on the current theme.
          - `handleToggle` is passed the toggleTheme function.
        */}
        <ToggleSwitch isOn={theme === "dark"} handleToggle={toggleTheme} />
      </div>
    </div>
  );
}
