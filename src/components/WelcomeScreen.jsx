import '../styles/welcomeScreen.css';

export default function WelcomeScreen({ onUpload, onTryDemo, currentRoomId, uploadFile }) {
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  }

  return (
    <div className="welcome-wrap">
      {/* Animated background blobs */}
      <div className="welcome-blob blob-1" />
      <div className="welcome-blob blob-2" />
      <div className="welcome-blob blob-3" />

      <div className="welcome-card">
        {/* Logo */}
        <div className="welcome-logo">
          <div className="welcome-logo-box">
            <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="welcome-logo-text">Pulse<em>BI</em></span>
        </div>

        {/* Heading */}
        <h1 className="welcome-title">
          Turn your data into<br />
          <span className="welcome-highlight">instant insights</span>
        </h1>
        <p className="welcome-sub">
          Upload your CSV file and ask questions in plain English.
          PulseBI will generate charts, dashboards, and analysis — instantly.
        </p>

        {/* Buttons */}
        <div className="welcome-actions">
          {/* Upload */}
          <label className="welcome-btn-primary">
            <input
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload your CSV
          </label>

          {/* Try Demo */}
          <button className="welcome-btn-secondary" onClick={onTryDemo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Try it out
            <span className="welcome-demo-tag">Demo</span>
          </button>
        </div>

        {/* Features */}
        <div className="welcome-features">
          <div className="welcome-feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Ask in plain English
          </div>
          <div className="welcome-feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Auto-generated charts
          </div>
          <div className="welcome-feature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Powered by Gemini AI
          </div>
        </div>
      </div>
    </div>
  );
}