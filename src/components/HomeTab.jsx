import WelcomeScreen from "./WelcomeScreen";

export default function HomeTab({
  rooms, currentRoomId, usage, switchRoom, newChat,
  uploadFile, roomFile, onTryDemo,
}) {
  const isReturningUser = rooms.length > 0;

  if (!isReturningUser) {
    return (
      <WelcomeScreen
        onTryDemo={onTryDemo}
        currentRoomId={currentRoomId}
        uploadFile={uploadFile}
        roomFile={roomFile}
      />
    );
  }

  return (
    <div className="home-returning">
      <div className="home-header">
        <h2 className="home-title">Welcome back 👋</h2>
        <p className="home-sub">Here's your PulseBI overview</p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-label">Model</div>
          <div className="stat-value">gemini-2.5-flash-lite</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Messages Used</div>
          <div className="stat-value">{usage.totalMessages}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Limit</div>
          <div className="stat-value">{usage.monthlyLimit}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Credits Left</div>
          <div className="stat-value" style={{
            color: (usage.monthlyLimit - usage.totalMessages) < 100 ? "var(--red)" : "var(--green)"
          }}>
            {Math.max(0, usage.monthlyLimit - usage.totalMessages)}
          </div>
        </div>
      </div>

      <div className="usage-bar-wrap">
        <div className="usage-bar-label">
          <span>Usage this month</span>
          <span>{Math.round((usage.totalMessages / usage.monthlyLimit) * 100)}%</span>
        </div>
        <div className="usage-bar-track">
          <div className="usage-bar-fill"
            style={{ width: `${Math.min(100, (usage.totalMessages / usage.monthlyLimit) * 100)}%` }}
          />
        </div>
      </div>

      <div className="home-section-title">Your Dashboards</div>
      <div className="home-rooms-grid">
        {[...rooms].reverse().map(r => (
          <div
            key={r.id}
            className={`home-room-card ${r.id === currentRoomId ? "active" : ""}`}
            onClick={() => switchRoom(r.id)}
          >
            <div className="home-room-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div className="home-room-info">
              <div className="home-room-name">{r.name || "New Dashboard"}</div>
              <div className="home-room-meta">{r.messages?.length || 0} messages</div>
            </div>
            {r.pinned && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent2)">
                <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
              </svg>
            )}
          </div>
        ))}
        <div className="home-room-card home-room-new" onClick={newChat}>
          <div className="home-room-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div className="home-room-info">
            <div className="home-room-name">New Dashboard</div>
            <div className="home-room-meta">Start fresh</div>
          </div>
        </div>
      </div>
    </div>
  );
}