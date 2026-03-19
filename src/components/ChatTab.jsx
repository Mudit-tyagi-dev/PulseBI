import { useState, useCallback } from "react";
import PromptBar from "./PromptBar";
import ChatMessages from "./ChatMessages";
import DashboardBlock from "./dashboard";

export default function ChatTab({
  messages, streamingText, latestDashboard,
  isStreaming, wsStatus, currentRoomId, geminiKey,
  backendRoomId, mode, onModeToggle, onSend,
  onOpenKeyModal, uploadFile, roomFile,
  chatOpen, onToggleChat,
}) {
  const hasMessages = messages.length > 0;
  const [chatWidth, setChatWidth] = useState(360);
  const [dragging, setDragging] = useState(false);

  const startDrag = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX;
    const startWidth = chatWidth;
    function onMove(e) {
      const delta = startX - e.clientX;
      const newWidth = Math.min(700, Math.max(260, startWidth + delta));
      setChatWidth(newWidth);
    }
    function onUp() {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [chatWidth]);

  // ── New chat screen ───────────────────────────────────────
  if (!hasMessages) {
    return (
      <div className="new-chat-screen">
        <div className="new-chat-center">
          <div className="new-chat-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="new-chat-title">New Dashboard</h2>
          <p className="new-chat-sub">Upload your CSV to get started, then ask anything</p>
          <label className="add-file-btn">
            <input type="file" accept=".csv" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files[0]) uploadFile(e.target.files[0]); }}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {roomFile ? `✓ ${roomFile}` : "Add CSV File"}
          </label>
          {roomFile && <p className="new-chat-file-note">File ready — ask your first question below</p>}
        </div>
        <div className="new-chat-prompt">
          <PromptBar
            onSend={onSend} isStreaming={isStreaming} wsStatus={wsStatus}
            currentRoomId={currentRoomId} geminiKey={geminiKey}
            backendRoomId={backendRoomId} onOpenKeyModal={onOpenKeyModal}
            mode={mode} onModeToggle={onModeToggle}
          />
        </div>
      </div>
    );
  }

  // ── Has messages ──────────────────────────────────────────
  return (
    <div className={`chat-dashboard-split ${dragging ? "dragging" : ""}`}>

      {/* Left — Dashboard + PromptBar (jab chat band ho) */}
      <div className="split-dashboard-col">
        <div className="split-dashboard">
          {latestDashboard ? (
            <div className="dashboard-scroll">
              <DashboardBlock
                data={latestDashboard.data}
                query={latestDashboard.query}
                explanation={latestDashboard.explanation}
              />
            </div>
          ) : (
            <div className="split-no-dashboard">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.2" opacity="0.3">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <p>No dashboard yet — ask a data question</p>
            </div>
          )}
        </div>

        {/* PromptBar — sirf jab chat band ho */}
        {!chatOpen && (
          <div className="split-bottom-prompt">
            <PromptBar
              onSend={onSend} isStreaming={isStreaming} wsStatus={wsStatus}
              currentRoomId={currentRoomId} geminiKey={geminiKey}
              backendRoomId={backendRoomId} onOpenKeyModal={onOpenKeyModal}
              mode={mode} onModeToggle={onModeToggle}
            />
          </div>
        )}
      </div>

      {/* Resize + Chat — sirf chatOpen ho to */}
      {chatOpen && (
        <>
          <div className="split-resize-handle" onMouseDown={startDrag} />
          <div className="split-chat-drawer" style={{ width: chatWidth }}>
            <div className="split-chat-header">
              <span className="split-chat-title">Conversation</span>
              <div className="split-chat-header-meta">
                {roomFile && (
                  <span className="split-file-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {roomFile}
                  </span>
                )}
                <button className="split-chat-close" onClick={onToggleChat}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="split-chat-messages">
              <ChatMessages
                messages={messages}
                streamingText={streamingText}
                onChipClick={onSend}
              />
            </div>
            <div className="split-chat-prompt">
              <PromptBar
                onSend={onSend} isStreaming={isStreaming} wsStatus={wsStatus}
                currentRoomId={currentRoomId} geminiKey={geminiKey}
                backendRoomId={backendRoomId} onOpenKeyModal={onOpenKeyModal}
                mode={mode} onModeToggle={onModeToggle}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}