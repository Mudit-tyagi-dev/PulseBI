import { useEffect, useRef } from "react";
import "../styles/chatmessages.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
// ── Markdown-lite formatter ───────────────────────────────────
function formatContent(content) {
  if (!content || typeof content !== "string")
    return (
      <p>
        {typeof content === "object"
          ? JSON.stringify(content)
          : String(content ?? "")}
      </p>
    );
  return content.split("\n").map((line, i) => {
    if (!line && i > 0) return <div key={i} className="msg-gap" />;
    const parts = line.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    return (
      <p key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          if (part.startsWith("`") && part.endsWith("`"))
            return <code key={j}>{part.slice(1, -1)}</code>;
          return part;
        })}
      </p>
    );
  });
}

// ── Single message bubble ─────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  const isError = msg.role === "error";
  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      <div className={`msg-avatar ${isUser ? "av-user" : "av-ai"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <div
        className={`msg-bubble ${isUser ? "bub-user" : isError ? "bub-error" : "bub-ai"}`}
      >
        <div className="msg-body">{formatContent(msg.content)}</div>
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

// ── Live streaming bubble ─────────────────────────────────────
function StreamingBubble({ text }) {
  return (
    <div className="msg-row ai">
      <div className="msg-avatar av-ai">AI</div>
      <div className="msg-bubble bub-ai streaming">
        {text ? (
          <div className="msg-body">
            {formatContent(text)}
            <span className="cursor-blink" />
          </div>
        ) : (
          <div className="typing-dots">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Suggestion chips ──────────────────────────────────────────
const CHIPS = [
  "Monthly revenue Q3 by region",
  "Top 5 products by sales",
  "Revenue growth YoY comparison",
  "Customer churn by segment",
  "Average order value trend",
];

function EmptyState({ onChip }) {
  return (
    <div className="empty-state">
      <div className="empty-glyph">
        <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
          <polyline
            points="36 11 22 24 14 16 4 27"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="26 11 36 11 36 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="empty-title">Your dashboard awaits</h2>
      <p className="empty-sub">
        Ask a business question or pick a suggestion — your CSV dataset is
        ready.
      </p>
      <div className="chip-grid">
        {CHIPS.map((c) => (
          <button key={c} className="chip" onClick={() => onChip(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function ChatMessages({ messages, streamingText, onChipClick }) {
  const bottomRef = useRef(null);
  const isStreaming = streamingText !== null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="messages-wrap">
        <EmptyState onChip={onChipClick} />
      </div>
    );
  }

  return (
    <div className="messages-wrap">
      <div className="messages-inner">
        {messages.map((m, i) => (
          <Message key={i} msg={m} />
        ))}
        {isStreaming && <StreamingBubble text={streamingText} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
export function ChartBlock({ data }) {
  if (!data) return null;
  const { labels, values, x_axis, y_axis } = data;
  return (
    <div style={{ width: "100%", maxWidth: "700px" }}>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: y_axis,
              data: values,
              backgroundColor: "rgba(108,99,255,0.7)",
              borderColor: "#6c63ff",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: x_axis, color: "#9098c8" },
              ticks: { color: "#9098c8" },
              grid: { color: "#1a1f3a" },
            },
            y: {
              title: { display: true, text: y_axis, color: "#9098c8" },
              ticks: { color: "#9098c8" },
              grid: { color: "#1a1f3a" },
            },
          },
        }}
      />
    </div>
  );
}
