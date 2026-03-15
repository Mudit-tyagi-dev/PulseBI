import { useState, useEffect } from "react";
import "./styles/global.css";
import "./styles/app.css";
import { useDashboard } from "./hooks/useDashboard";
import Sidebar from "./components/Sidebar";
import ChatMessages, { ChartBlock } from "./components/ChatMessages";
import PromptBar from "./components/PromptBar";
import GeminiKeyModal from "./components/GeminiKeyModal";

export default function App() {
  const {
    rooms,
    currentRoomId,
    messages,
    geminiKey,
    serverStatus,
    wsStatus,
    streamingText,
    showKeyModal,
    setShowKeyModal,
    saveGeminiKey,
    switchRoom,
    newChat,
    removeRoom,
    sendMessage,
  } = useDashboard();

  const [activeNav, setActiveNav] = useState("overview");
  const [mode, setMode] = useState("query");
  const [chartMessages, setChartMessages] = useState([]);
  const isStreaming = streamingText !== null;

  useEffect(() => {
    if (mode !== "chart") return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;
    if (
      lastMsg.role === "assistant" ||
      lastMsg.type === "chart" ||
      lastMsg.role === "error"
    ) {
      setChartMessages((prev) => {
        const already = prev.find((m) => m.ts === lastMsg.ts);
        if (already) return prev;
        return [...prev, lastMsg];
      });
    }
  }, [messages, mode]);

  function onModeToggle() {
    setMode((prev) => (prev === "query" ? "chart" : "query"));
  }

  function handleSend(text) {
    if (mode === "chart") {
      setChartMessages((prev) => [
        ...prev,
        { role: "user", content: text, ts: Date.now() },
      ]);
      sendMessage(text, "chart");
    } else {
      sendMessage(text, "query");
    }
  }

  function handleExport() {
    if (!messages.length) {
      alert("No messages to export.");
      return;
    }
    const txt = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = `pulsebi-${currentRoomId || "chat"}.txt`;
    a.click();
  }

  return (
    <div className="app">
      <Sidebar
        rooms={rooms}
        currentRoomId={currentRoomId}
        geminiKey={geminiKey}
        serverStatus={serverStatus}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onNewChat={newChat}
        onSwitchRoom={switchRoom}
        onDeleteRoom={removeRoom}
        onOpenKeyModal={() => setShowKeyModal(true)}
      />

      <div className="main">
        <div className="topbar">
          <div className="tb-left">
            <span className="tb-tag">AI-Powered Insights</span>
            <div className="live-pill">
              <span className="live-dot" />
              LIVE
            </div>
          </div>
          <div className="tb-right">
            <button className="tb-btn" onClick={handleExport}>
              Export
            </button>
            <button
              className="tb-btn key"
              onClick={() => setShowKeyModal(true)}
            >
              API Key
            </button>
          </div>
        </div>

        <div className="chat-panel">
          <div
            className={`chat-messages-wrap ${mode === "chart" ? "minimized" : ""}`}
          >
            <ChatMessages
              messages={messages}
              streamingText={streamingText}
              onChipClick={handleSend}
            />
          </div>

          {mode === "chart" && (
            <div className="chart-fullscreen">
              <div className="chart-top-btns">
                <button
                  className="chart-close-btn"
                  onClick={() => setMode("query")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Close Chart
                </button>
                <button
                  className="chart-clear-btn"
                  onClick={() => setChartMessages([])}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                  Clear Chat
                </button>
              </div>
              <div className="chart-area">
                {chartMessages.length === 0 ? (
                  <p className="chart-empty">
                    Chart mode active — ask a chart question below
                  </p>
                ) : (
                  <div className="chart-messages-list">
                    {chartMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`chart-msg ${m.role === "user" ? "chart-msg-user" : "chart-msg-ai"}`}
                      >
                        {m.type === "chart" ? (
                          <ChartBlock data={m.data} />
                        ) : (
                          <p>{m.content ?? m.data}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <PromptBar
            onSend={handleSend}
            isStreaming={isStreaming}
            wsStatus={wsStatus}
            currentRoomId={currentRoomId}
            geminiKey={geminiKey}
            onOpenKeyModal={() => setShowKeyModal(true)}
            mode={mode}
            onModeToggle={onModeToggle}
          />
        </div>
      </div>

      {showKeyModal && (
        <GeminiKeyModal
          currentKey={geminiKey}
          onSave={saveGeminiKey}
          onClose={() => setShowKeyModal(false)}
        />
      )}
    </div>
  );
}
