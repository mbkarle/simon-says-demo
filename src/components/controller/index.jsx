import "./controller.css";
import { SIGNALS } from "../../logic";

const capitalize = (word) =>
  `${word.charAt(0).toUpperCase()}${word.substring(1)}`;

const Button = ({ signal, onInput, className = "" }) => {
  return (
    <button className={`controller-button ${className}`} onClick={() => onInput(signal)}>
      {capitalize(signal)}
    </button>
  );
};

const Controller = ({ onInput }) => {
  return (
    <div className="controller-container">
      <div className="controller-row">
        <Button signal={SIGNALS.UP} onInput={onInput} />
      </div>
      <div className="controller-row">
        <Button signal={SIGNALS.LEFT} onInput={onInput} />
        <Button signal={SIGNALS.RIGHT} onInput={onInput} />
      </div>
      <div className="controller-row">
        <Button signal={SIGNALS.DOWN} onInput={onInput} />
      </div>
      <div className="controller-row">
        <Button signal={SIGNALS.PASS} className="controller-pass" onInput={onInput} />
      </div>
    </div>
  );
};

export default Controller;
