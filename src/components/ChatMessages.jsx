import { useEffect, useRef, useState } from "react";
import "../styles/chatmessages.css";

function formatContent(content) {
  if (!content) return null;
  return content.split("\n").map((line, i) => <p key={i}>{line}</p>);
}

const LOADING_PHASES = [
  { until: 3000,     text: "Thinking",                isError: false },
  { until: 6000,     text: "Analysing data",           isError: false },
  { until: 12000,    text: "Taking longer than usual", isError: false },
  { until: Infinity, text: "Something went wrong",     isError: true  },
];

function LoadingBubble() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const timers = LOADING_PHASES
      .filter((p) => p.until !== Infinity)
      .map((phase, i) => setTimeout(() => setPhaseIndex(i + 1), phase.until));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (LOADING_PHASES[phaseIndex].isError) return;
    const id = setInterval(() => setDotCount((d) => (d % 3) + 1), 500);
    return () => clearInterval(id);
  }, [phaseIndex]);

  const phase = LOADING_PHASES[phaseIndex];

  return (
    <div className="msg-row ai">
      <div className="msg-avatar">AI</div>
      <div className={`msg-bubble ai ${phase.isError ? "loading-error" : "loading-bubble"}`}>
        {phase.isError ? (
          <span>⚠ Something went wrong. Please try again.</span>
        ) : (
          <span>
            {phase.text}
            <span className="loading-dots">{"·".repeat(dotCount)}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function DashboardCard({ msg, onViewDashboard }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-icon">📊</div>
      <div className="dashboard-card-info">
        <span className="dashboard-card-title">Chart ready</span>
        <span className="dashboard-card-sub">View it on your dashboard</span>
      </div>
      <button className="dashboard-card-btn" onClick={onViewDashboard}>
        View →
      </button>
    </div>
  );
}

function Message({ msg, onViewDashboard }) {
  const isUser  = msg.role === "user";
  const isChart = msg.type === "dashboard";

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      <div className="msg-avatar">{isUser ? "You" : "AI"}</div>
      <div className={`msg-bubble ${isUser ? "user" : "ai"}`}>
        {isChart ? (
          <DashboardCard msg={msg} onViewDashboard={onViewDashboard} />
        ) : (
          <div className="msg-body">{formatContent(msg.content)}</div>
        )}
        {msg.ts && (
          <div className="msg-ts">
            {new Date(msg.ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatMessages({ messages, isLoading, onChipClick, onViewDashboard }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="messages-wrap">
      {messages.map((m, i) => (
        <Message key={i} msg={m} onViewDashboard={onViewDashboard} />
      ))}
      {isLoading && <LoadingBubble />}
      <div ref={bottomRef} />
    </div>
  );
}