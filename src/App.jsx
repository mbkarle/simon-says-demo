import "./App.css";
import Simon from "./components/simon";
import Controller from "./components/controller";
import { useGameState } from "./logic";

function App() {
  const [simonState, onInput] = useGameState();

  return (
    <div className="game-controller">
      <Simon {...simonState} />
      <Controller onInput={onInput} />
    </div>
  );
}

export default App;
