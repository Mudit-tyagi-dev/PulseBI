const ROOMS_KEY = 'bi_rooms';
const LAST_ROOM_KEY = 'bi_last_room';
const GEMINI_KEY = 'bi_gemini_key';

function getRooms() {
  try {
    const data = JSON.parse(localStorage.getItem(ROOMS_KEY) || '{}');
    // Agar array hai to object mein convert karo
    if (Array.isArray(data)) {
      const obj = {};
      data.forEach(r => { if (r?.id) obj[r.id] = r; });
      localStorage.setItem(ROOMS_KEY, JSON.stringify(obj)); // fix save karo
      return obj;
    }
    return data;
  }
  catch { return {}; }
}

function saveRooms(rooms) {
  // Array kabhi save mat karo — hamesha object
  if (Array.isArray(rooms)) {
    const obj = {};
    rooms.forEach(r => { if (r?.id) obj[r.id] = r; });
    localStorage.setItem(ROOMS_KEY, JSON.stringify(obj));
  } else {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  }
}

export function createRoom(name = 'New Chat') {
  const rooms = getRooms();
  const room = { id: `room_${Date.now()}`, name, messages: [] };
  rooms[room.id] = room;
  saveRooms(rooms);
  // console.log("createRoom:", room.id, "total:", Object.keys(rooms).length);
  return { ...room };
}

export function upsertRoom(room) {
  const rooms = getRooms();
  rooms[room.id] = { ...room };
  saveRooms(rooms);
  return { ...room };
}

export function getRoom(roomId) {
  const r = getRooms()[roomId];
  return r ? { ...r } : null;
}

export function getRoomById(roomId) {
  const r = getRooms()[roomId];
  return r ? { ...r } : null;
}

export function addMessage(roomId, message) {
  const rooms = getRooms();
  if (!rooms[roomId]) {
    rooms[roomId] = { id: roomId, name: 'New Chat', messages: [] };
  }
  rooms[roomId].messages.push(message);
  saveRooms(rooms);
  return { ...rooms[roomId], messages: [...rooms[roomId].messages] };
}

export function getAllRooms() {
  const data = getRooms();
  // console.log("getAllRooms keys:", Object.keys(data));
  return Object.values(data).map(r => ({ ...r }));
}

export function deleteRoom(roomId) {
  const rooms = getRooms();
  delete rooms[roomId];
  saveRooms(rooms);
}

export function getLastRoomId() {
  return localStorage.getItem(LAST_ROOM_KEY) || null;
}

export function setLastRoomId(roomId) {
  localStorage.setItem(LAST_ROOM_KEY, roomId);
}

export function getStoredGeminiKey() {
  return localStorage.getItem(GEMINI_KEY) || '';
}

export function storeGeminiKey(key) {
  localStorage.setItem(GEMINI_KEY, key);
}

const USAGE_KEY = 'bi_usage';

export function getUsage() {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || '{"totalMessages":0,"monthlyLimit":1500}'); }
  catch { return { totalMessages: 0, monthlyLimit: 1500 }; }
}

export function incrementUsage() {
  const usage = getUsage();
  usage.totalMessages = (usage.totalMessages || 0) + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function setMonthlyLimit(limit) {
  const usage = getUsage();
  usage.monthlyLimit = limit;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}
export function deleteMessage(roomId, messageId) {
  const rooms = getRooms();
  if (!rooms[roomId]) return null;
  rooms[roomId].messages = rooms[roomId].messages.filter(m => m.id !== messageId);
  saveRooms(rooms);
  return { ...rooms[roomId], messages: [...rooms[roomId].messages] };
}