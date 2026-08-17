import { useState, useEffect } from "react";

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const s = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Stopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsedMs((prev) => prev + 10);
    }, 10);
    return () => clearInterval(id);
  }, [running]);

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const ms = Math.floor((elapsedMs % 1000) / 10).toString().padStart(2, "0");

  return (
    <div className="panel">
      <p className="display">{formatTime(totalSeconds)}.{ms}</p>
      <div className="controls">
        <button onClick={() => setRunning(true)} disabled={running}>Start</button>
        <button onClick={() => setRunning(false)} disabled={!running}>Pause</button>
        <button onClick={() => { setRunning(false); setElapsedMs(0); }}>Reset</button>
      </div>
    </div>
  );
}

function Countdown() {
  const [inputMin, setInputMin] = useState(1);
  const [inputSec, setInputSec] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    if (secondsLeft <= 0) {
      setSecondsLeft(Number(inputMin) * 60 + Number(inputSec));
    }
    setDone(false);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setDone(false);
    setSecondsLeft(Number(inputMin) * 60 + Number(inputSec));
  }

  return (
    <div className="panel">
      {!running && secondsLeft === Number(inputMin) * 60 + Number(inputSec) && (
        <div className="inputs">
          <input type="number" min="0" value={inputMin}
            onChange={(e) => setInputMin(e.target.value)} /> min
          <input type="number" min="0" max="59" value={inputSec}
            onChange={(e) => setInputSec(e.target.value)} /> sec
        </div>
      )}
      <p className="display">{done ? "Time's up!" : formatTime(secondsLeft)}</p>
      <div className="controls">
        <button onClick={start} disabled={running}>Start</button>
        <button onClick={() => setRunning(false)} disabled={!running}>Pause</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

function Pomodoro() {
  const FOCUS = 25 * 60;
  const BREAK = 5 * 60;

  const [phase, setPhase] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhase((prevPhase) => {
            if (prevPhase === "focus") {
              setCycles((c) => c + 1);
              setSecondsLeft(BREAK);
              return "break";
            } else {
              setSecondsLeft(FOCUS);
              return "focus";
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function reset() {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(FOCUS);
    setCycles(0);
  }

  return (
    <div className="panel">
      <p className="phase">{phase === "focus" ? "Focus" : "Break"} · Cycle {cycles}</p>
      <p className="display">{formatTime(secondsLeft)}</p>
      <div className="controls">
        <button onClick={() => setRunning(true)} disabled={running}>Start</button>
        <button onClick={() => setRunning(false)} disabled={!running}>Pause</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("stopwatch");

  return (
    <div className="wrap">
      <div className="tabs">
        <button className={tab === "stopwatch" ? "active" : ""} onClick={() => setTab("stopwatch")}>Stopwatch</button>
        <button className={tab === "countdown" ? "active" : ""} onClick={() => setTab("countdown")}>Countdown</button>
        <button className={tab === "pomodoro" ? "active" : ""} onClick={() => setTab("pomodoro")}>Pomodoro</button>
      </div>

      {tab === "stopwatch" && <Stopwatch />}
      {tab === "countdown" && <Countdown />}
      {tab === "pomodoro" && <Pomodoro />}

      <style>{`
        .wrap { max-width: 500px; margin: 0 auto; padding: 1rem; }
        .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .tabs button { flex: 1; padding: 0.6rem; cursor: pointer; border: 1px solid #ccc; background: #f5f5f5; }
        .tabs button.active { background: #333; color: white; }
        .panel { border: 1px solid #ddd; border-radius: 8px; padding: 2rem; text-align: center; }
        .display { font-size: 3rem; font-family: monospace; margin: 1rem 0; }
        .phase { font-weight: bold; color: #666; }
        .controls { display: flex; gap: 0.5rem; justify-content: center; }
        .controls button { padding: 0.5rem 1rem; cursor: pointer; }
        .controls button:disabled { opacity: 0.5; cursor: not-allowed; }
        .inputs { display: flex; gap: 0.5rem; justify-content: center; align-items: center; }
        .inputs input { width: 50px; padding: 0.3rem; }
        @media (max-width: 480px) { .tabs { flex-direction: column; } .display { font-size: 2.2rem; } }
      `}</style>
    </div>
  );
}

export default App;