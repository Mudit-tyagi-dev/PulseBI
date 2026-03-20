import { useState, useRef, useEffect } from "react";
import { WS_STATUS } from "../utils/socket";
import "../styles/promptBar.css";

const MODELS_URL = "https://biz-dash-backend.onrender.com/config/models";
const CONFIG_URL = "https://biz-dash-backend.onrender.com/config/rooms";

export default function PromptBar({
  onSend, isStreaming, wsStatus,
  currentRoomId, backendRoomId, geminiKey,
  onOpenKeyModal, mode, onModeToggle,
}) {
  const [text, setText] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const ref = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch(MODELS_URL);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setModels(json.data);
          setSelectedModel(json.data[0]);
        }
      } catch (e) { console.error(e); }
      finally { setModelsLoading(false); }
    }
    fetchModels();
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setModelDropOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function handleModelChange(model) {
    setSelectedModel(model);
    setModelDropOpen(false);
    const roomId = backendRoomId || currentRoomId;
    if (!roomId) return;
    try {
      await fetch(`${CONFIG_URL}/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_model: model, api_key: geminiKey || "" }),
      });
    } catch (e) { console.error(e); }
  }

  const isOpen = wsStatus === WS_STATUS.OPEN;
  const canSend = text.trim().length > 0 && !isStreaming && isOpen;

  function autoResize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function handleSend() {
    if (!canSend) return;
    onSend(text.trim(), selectedModel);
    setText("");
    if (ref.current) ref.current.style.height = "";
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const wsClass = wsStatus === WS_STATUS.OPEN ? "ws-open"
    : wsStatus === WS_STATUS.CONNECTING ? "ws-connecting"
    : wsStatus === WS_STATUS.ERROR ? "ws-error"
    : "ws-closed";

  return (
    <div className="prompt-bar">
      <div className="prompt-row">

        <div className={`prompt-wrap ${isStreaming ? "streaming" : ""} ${!isOpen ? "disconnected" : ""}`}>

          {/* WS dot inside prompt box */}
          <div className={`prompt-ws-dot ${wsClass}`} title={
            wsStatus === WS_STATUS.OPEN ? "Connected"
            : wsStatus === WS_STATUS.CONNECTING ? "Connecting…"
            : "Disconnected"
          } />

          <textarea
            ref={ref}
            className="prompt-input"
            placeholder={
              isOpen
                ? mode === "chart" ? "Ask for a chart…" : "Ask anything about your data…"
                : "Connecting…"
            }
            value={text}
            rows={1}
            disabled={isStreaming || !isOpen}
            onChange={(e) => { setText(e.target.value); autoResize(); }}
            onKeyDown={handleKey}
          />

          <div className="prompt-actions">
            {/* Model picker */}
            <div className="model-drop-wrap" ref={dropRef}>
              <button
                className="model-drop-btn"
                onClick={() => setModelDropOpen(p => !p)}
                disabled={modelsLoading}
                title="AI Model"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                </svg>
                <span className="model-drop-label">
                  {modelsLoading ? "…" : selectedModel || "Model"}
                </span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {modelDropOpen && models.length > 0 && (
                <div className="model-dropdown">
                  <div className="model-drop-header">AI Model</div>
                  {models.map(m => (
                    <button
                      key={m}
                      className={`model-drop-item ${selectedModel === m ? "active" : ""}`}
                      onClick={() => handleModelChange(m)}
                    >
                      <span className="model-dot" />
                      {m}
                      {selectedModel === m && (
                        <svg className="model-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send */}
        <button className="send-btn" onClick={handleSend} disabled={!canSend} title="Send (Enter)">
          {isStreaming ? <span className="spin" /> : (
            <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          )}
        </button>

        {/* Mode toggle */}
        <div className="mode-slider" onClick={onModeToggle} title={mode === "chart" ? "Switch to Query" : "Switch to Chart"}>
          <div className={`mode-slider-track ${mode === "chart" ? "active" : ""}`}>
            <div className="mode-slider-thumb" />
          </div>
          <span className="mode-slider-label">{mode === "chart" ? "Chart" : "Query"}</span>
        </div>
      </div>

      {!geminiKey && (
        <div className="prompt-footer">
          <button className="key-warn" onClick={onOpenKeyModal}>⚠ Set Gemini API key</button>
        </div>
      )}
    </div>
  );
}