import "../styles/ToggleSwitch.scss";
// Define the props the component will accept
interface ToggleSwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

const ToggleSwitch = ({ isOn, handleToggle }: ToggleSwitchProps) => {
  return (
    <label className="toggle-switch">
      {/* The actual checkbox is hidden, but we use its checked state */}
      <input type="checkbox" checked={isOn} onChange={handleToggle} />
      {/* The 'slider' is the visual part of the switch */}
      <span className="slider" />
    </label>
  );
};

export default ToggleSwitch;
