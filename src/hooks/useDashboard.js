import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllRooms, createRoom, upsertRoom, deleteRoom, getRoomById,
  getLastRoomId, setLastRoomId, getStoredGeminiKey, storeGeminiKey,
} from "../utils/chatStorage";
import { setRoomConfig, healthCheck } from "../api/backend";
import { useWebSocket } from "./useWebSocket";

export function useDashboard() {
  const [rooms, setRooms] = useState([]);
  const roomsRef = useRef([]);

  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [geminiKey, setGeminiKeyState] = useState("");
  const [serverStatus, setServerStatus] = useState("unknown");
  const [showKeyModal, setShowKeyModal] = useState(false);

  const backendRoomIdRef = useRef(null);

  const [roomFileMap, setRoomFileMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("roomFileMap") || "{}"); }
    catch { return {}; }
  });

  // Rooms update karo — ref + state dono
  const updateRooms = useCallback(() => {
    const latest = [...getAllRooms()];
    roomsRef.current = latest;
    setRooms(latest);
  }, []);

  useEffect(() => {
    const key = getStoredGeminiKey();
    setGeminiKeyState(key);
    updateRooms();

    const allRooms = getAllRooms();
    if (allRooms.length > 0) {
      const lastId = getLastRoomId();
      const restored = lastId && allRooms.find((r) => r.id === lastId)
        ? lastId : allRooms[allRooms.length - 1].id;
      setCurrentRoomId(restored);
      setMessages(getRoomById(restored)?.messages || []);
      const savedBackendId = localStorage.getItem(`ws_room_${restored}`);
      if (savedBackendId) backendRoomIdRef.current = savedBackendId;
    }

    healthCheck().then(() => setServerStatus("ok")).catch(() => setServerStatus("error"));
  }, []);

  const { wsStatus, sendMessage: wsSend, streamingText } = useWebSocket({
    roomId: currentRoomId,
    onNewMessage: (msgs) => {
      setMessages([...msgs]);
      updateRooms();
    },
    onRoomNameUpdate: () => updateRooms(),
    onRoomIdReceived: async (backendRoomId) => {
      const storageKey = `ws_room_${currentRoomId}`;
      const alreadySaved = localStorage.getItem(storageKey);
      if (!alreadySaved) localStorage.setItem(storageKey, backendRoomId);
      backendRoomIdRef.current = alreadySaved || backendRoomId;

      const freshKey = getStoredGeminiKey();
      if (freshKey) {
        try { await setRoomConfig(backendRoomIdRef.current, freshKey); }
        catch (e) { console.warn("setRoomConfig error:", e.message); }
      }
    },
  });

  const saveGeminiKey = useCallback(async (key) => {
    storeGeminiKey(key);
    setGeminiKeyState(key);
    setShowKeyModal(false);

    const roomId = backendRoomIdRef.current;
    if (roomId) {
      try { await setRoomConfig(roomId, key); }
      catch (e) { console.warn("setRoomConfig skipped:", e.message); }
    }

    if (!currentRoomId) {
      const room = createRoom("New Dashboard");
      updateRooms();
      setCurrentRoomId(room.id);
      setLastRoomId(room.id);
      setMessages([]);
    }
  }, [currentRoomId, updateRooms]);

  const switchRoom = useCallback((roomId) => {
    setCurrentRoomId(roomId);
    setLastRoomId(roomId);
    setMessages(getRoomById(roomId)?.messages || []);
    const savedBackendId = localStorage.getItem(`ws_room_${roomId}`);
    backendRoomIdRef.current = savedBackendId || null;
  }, []);

  const newChat = useCallback(async () => {
    const room = createRoom("New Dashboard");
    backendRoomIdRef.current = null;
    const updated = [...getAllRooms()];
    roomsRef.current = updated;
    setRooms(updated);
    setCurrentRoomId(room.id);
    setLastRoomId(room.id);
    setMessages([]);
    // console.log("newChat — rooms after setRooms:", updated.length);
    return room;
  }, []);

  const removeRoom = useCallback((roomId) => {
    deleteRoom(roomId);
    localStorage.removeItem(`ws_room_${roomId}`);

    setRoomFileMap((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      localStorage.setItem("roomFileMap", JSON.stringify(updated));
      return updated;
    });

    updateRooms();

    const remaining = getAllRooms();
    if (currentRoomId === roomId) {
      if (remaining.length > 0) {
        switchRoom(remaining[remaining.length - 1].id);
      } else {
        setCurrentRoomId(null);
        setMessages([]);
        backendRoomIdRef.current = null;
      }
    }
  }, [currentRoomId, switchRoom, updateRooms]);

  const sendMessage = useCallback(async (text, mode = "query") => {
    if (!text.trim()) return;
    if (!geminiKey) { setShowKeyModal(true); return; }

    let roomId = currentRoomId;
    if (!roomId) {
      const room = await newChat();
      roomId = room.id;
      await new Promise(r => setTimeout(r, 50));
    }

    wsSend(text, mode === "chart" ? "chart" : "query");
  }, [currentRoomId, geminiKey, newChat, wsSend]);

  const uploadFile = useCallback(async (file) => {
    const roomId = backendRoomIdRef.current || currentRoomId;

    if (!roomId) {
      alert("Pehle ek message bhejo taaki room ban sake!");
      return { success: false, reason: "no_room" };
    }

    if (roomFileMap[currentRoomId]) {
      alert(`Is dashboard mein "${roomFileMap[currentRoomId]}" already upload hai. Naya dashboard banao nayi file ke liye.`);
      return { success: false, reason: "already_uploaded" };
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `https://biz-dash-backend.onrender.com/upload/csv/${roomId}`,
        { method: "POST", body: formData },
      );
      const json = await res.json();
      if (json.success !== false) {
        setRoomFileMap((prev) => {
          const updated = { ...prev, [currentRoomId]: file.name };
          localStorage.setItem("roomFileMap", JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      } else {
        alert("Upload failed: " + (json.message || "Unknown error"));
        return { success: false, reason: "server_error" };
      }
    } catch (e) {
      console.error("Upload failed:", e);
      alert("Upload failed — server se connection nahi hua");
      return { success: false, reason: "network_error" };
    }
  }, [currentRoomId, roomFileMap]);

  return {
    rooms, currentRoomId, messages, geminiKey, serverStatus,
    wsStatus, streamingText, showKeyModal, setShowKeyModal,
    saveGeminiKey, switchRoom, newChat, removeRoom, sendMessage,
    uploadFile, roomFile: roomFileMap[currentRoomId] || null,
    backendRoomId: backendRoomIdRef.current,
  };
}