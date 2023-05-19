/*---------- HERE BE DRAGONS -----------*/
import { useEffect, useState, useCallback, useMemo } from "react";

const UPDATE_INTERVAL = 30;

const PRECISION = UPDATE_INTERVAL - 1;

export const SIGNALS = {
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left",
  PASS: "pass",
};

export const MOVES = [SIGNALS.UP, SIGNALS.RIGHT, SIGNALS.LEFT, SIGNALS.DOWN];

export const PASS_INSTRUCTION = [SIGNALS.PASS];

export const createInstruction = (numMoves) => {
  const instruction = [];
  for (let i = 0; i < numMoves; i++) {
    instruction.push(MOVES[Math.floor(Math.random() * MOVES.length)]);
  }
  return instruction;
};

export const makeInstructionText = (instruction) => {
  let last = "";
  let dupCount = 0;

  const nTimesText = (n) => `${n} time${n > 1 ? "s" : ""}`;

  const reduce = (acc, curr) => {
    let newText = "";
    if (curr !== last) {
      if (dupCount > 0) {
        newText += `${nTimesText(dupCount)}, `;
      }
      newText += `${curr} `;
      last = curr;
      dupCount = 1;
    } else {
      dupCount++;
    }
    return `${acc}${newText}`;
  };

  let text = instruction.reduce(reduce, "Go ");
  return `${text} ${nTimesText(dupCount)}`;
};

export const EXIT_STATES = {
  SUCCESS: "success",
  PENDING: "pending",
  FAILURE: "failure",
};

export const useInstructionEvaluator = (instruction) => {
  const [moveNum, setMoveNum] = useState(0);

  const evaluator = useCallback(
    (move) => {
      if (move !== instruction[moveNum]) return EXIT_STATES.FAILURE;

      const updatedNum = moveNum + 1;
      setMoveNum(updatedNum >= instruction.length ? 0 : updatedNum);
      return updatedNum >= instruction.length
        ? EXIT_STATES.SUCCESS
        : EXIT_STATES.PENDING;
    },
    [moveNum, instruction]
  );

  return evaluator;
};

const NUM_LEVELS = 50;
const INTERPOLATIONS = {
  duration: { init: 10000, end: 4000 },
  threshold: { init: 0.8, end: 0.6 },
  numMoves: { init: 2, end: 6, discrete: true },
};

const getStateAtLevel = (level) => {
  return Object.keys(INTERPOLATIONS).reduce(
    (state, key) => {
      const { init, end, discrete } = INTERPOLATIONS[key];
      const diff = end - init;
      const interp = init + (diff * level) / (NUM_LEVELS - 1);
      return { ...state, [key]: discrete ? Math.round(interp) : interp };
    },
    { level }
  );
};

const useInterpolatedState = (status) => {
  const [state, setState] = useState(() => getStateAtLevel(0));

  useEffect(() => {
    if (status === EXIT_STATES.SUCCESS) {
      setState((current) =>
        current.level < NUM_LEVELS
          ? getStateAtLevel(current.level + 1)
          : { ...current, level: current.level + 1 }
      );
    }
  }, [status]);

  return state;
};

/* The mega state monster - runs all game logic... don't look too closely... */
export const useGameState = () => {
  /* At any time the player is either:
   * pending - playing through a round
   * successful - won a round, a new round needs to be started
   * failure - player lost, game is over
   */
  const [status, setStatus] = useState(EXIT_STATES.PENDING);

  // On changes to status, key hyperparameters update to increase game difficulty
  const interpolatedState = useInterpolatedState(status);

  // Time in round begins at round's max duration and drops to 0
  const [remaining, setRemaining] = useState(interpolatedState.duration);

  useEffect(() => {
    if (Math.abs(remaining) < PRECISION) {
      setRemaining(0);
      setStatus(EXIT_STATES.FAILURE);
    } else if (status === EXIT_STATES.PENDING) {
      setTimeout(() => {
        setRemaining((current) => current - UPDATE_INTERVAL);
      }, UPDATE_INTERVAL);
    }
  }, [remaining, status]);

  // maintain whether simon is saying as well as the proposed instruction
  const [simonSays, setSimonSays] = useState(true);
  const [statedInstruction, setStatedInstruction] = useState(() =>
    createInstruction(interpolatedState.numMoves)
  );

  // listen for changes to interpolated hyperparameters to start new round with correct scaling
  useEffect(() => {
    setRemaining(interpolatedState.duration);
    setStatedInstruction(() => createInstruction(interpolatedState.numMoves));
    setSimonSays(Math.random() < interpolatedState.threshold);
    setStatus(EXIT_STATES.PENDING);
  }, [interpolatedState]);

  // memoize the actual instruction to evaluate i.e. if simon does not say it should be different from
  // instruction text on screen (should be just "PASS")
  const instruction = useMemo(
    () => (simonSays ? statedInstruction : PASS_INSTRUCTION),
    [statedInstruction, simonSays]
  );

  // access evaluator function to check player's inputs
  // returns a status enum
  const evaluator = useInstructionEvaluator(instruction);

  // input listener to pass down to player controller components
  const onInput = useCallback(
    (signal) =>
      setStatus((current) =>
        current === EXIT_STATES.FAILURE ? current : evaluator(signal)
      ),
    [evaluator]
  );

  // instruction text to show on screen
  const [instructionText, setInstructionText] = useState("Getting ready...");

  // update instruction text on changes to proposal and to game status
  useEffect(() => {
    if (status === EXIT_STATES.FAILURE) {
      setInstructionText("Failure...");
    } else {
      setInstructionText(makeInstructionText(statedInstruction));
    }
  }, [statedInstruction, status]);

  // props to be passed to Simon component
  const simonState = {
    duration: interpolatedState.duration, // duration of round
    remaining, // time remaining in round
    simonSays, // whether to display "Simon Says"
    instruction: instructionText, // instruction text to display
  };

  return [simonState, onInput];
};
