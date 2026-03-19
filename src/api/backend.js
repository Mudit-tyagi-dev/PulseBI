const BASE_URL = (
  import.meta.env.VITE_API_URL || "https://biz-dash-backend.onrender.com"
).replace(/\/$/, "");

// GET /  — Health Check
export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error("Server unreachable");
  return res.json();
}

// POST /config/rooms/{room_id}  — Set config
// ── model parameter add kiya — hardcode nahi ab ──
export async function setRoomConfig(roomId, geminiApiKey, model = "gemini-2.5-flash-lite") {
  const res = await fetch(`${BASE_URL}/config/rooms/${roomId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ai_model: model,
      api_key: geminiApiKey,
    }),
  });
  const data = await res.json();
  console.log("setRoomConfig response:", data);
  if (!res.ok) throw new Error(data.detail || `Config failed: ${res.status}`);
  return data;
}

// GET /config/rooms/{room_id}  — Get room config
export async function getRoomConfig(roomId) {
  const res = await fetch(`${BASE_URL}/config/rooms/${roomId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Get config failed: ${res.status}`);
  }
  return res.json();
}