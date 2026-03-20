import { useState, useEffect } from 'react';
import '../styles/gemni.css';

const TABS = ["API Key", "Appearance"];

export default function SettingsModal({ currentKey, onSave, onClose, theme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState("API Key");
  const [val, setVal] = useState(currentKey || '');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const k = val.trim();
    if (!k) { setErr('Please enter your Gemini API key.'); return; }
    if (!k.startsWith('AIza')) { setErr('Key should start with "AIza…"'); return; }
    setSaving(true); setErr('');
    try { await onSave(k); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-back" onClick={e => e.target === e.currentTarget && currentKey && onClose()}>
      <div className="modal-box">

        {/* Header */}
        <div className="modal-hd">
          <div className="modal-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h2 className="modal-title">Settings</h2>
            <p className="modal-sub">Manage your API key and appearance</p>
          </div>
          {currentKey && (
            <button className="modal-close-btn" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`modal-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── API Key Tab ── */}
        {activeTab === "API Key" && (
          <div className="modal-tab-content">
            <label className="modal-label">Gemini API Key</label>
            <input
              type="password"
              className={`modal-input ${err ? 'has-err' : ''}`}
              placeholder="AIzaSy…"
              value={val}
              onChange={e => { setVal(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              autoComplete="off"
            />
            {err && <p className="modal-err">{err}</p>}
            <p className="modal-hint">
              Get your key from{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                Google AI Studio
              </a>
            </p>
            <div className="modal-actions">
              {currentKey && <button className="btn-secondary" onClick={onClose}>Cancel</button>}
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Connect'}
              </button>
            </div>
          </div>
        )}

        {/* ── Appearance Tab ── */}
        {activeTab === "Appearance" && (
          <div className="modal-tab-content">
            <label className="modal-label">Theme</label>
            <div className="theme-options">
              {[
                {
                  id: "dark",
                  label: "Dark",
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>
                  ),
                  preview: ["#080b18", "#0e1226", "#6c63ff"],
                },
                {
                  id: "light",
                  label: "Light",
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ),
                  preview: ["#f0f2f9", "#ffffff", "#6c63ff"],
                },
                {
                  id: "system",
                  label: "System",
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  ),
                  preview: ["#080b18", "#f0f2f9", "#6c63ff"],
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`theme-option ${theme === opt.id ? "active" : ""}`}
                  onClick={() => onThemeChange(opt.id)}
                >
                  <div className="theme-preview">
                    {opt.preview.map((c, i) => (
                      <div key={i} className="theme-preview-swatch" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="theme-option-icon">{opt.icon}</div>
                  <span className="theme-option-label">{opt.label}</span>
                  {theme === opt.id && (
                    <div className="theme-active-dot">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="modal-actions" style={{marginTop: "8px"}}>
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}