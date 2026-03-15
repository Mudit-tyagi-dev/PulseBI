// ─────────────────────────────────────────────
//  useWebSocket.js
//
//  Creates a WebSocket per room_id.
//  Reconnects automatically when room changes.
//  Streams AI tokens directly into the message list.
//
//  Returns:
//    wsStatus       WS_STATUS string (open/connecting/closed/error)
//    sendMessage    (text: string) => void
//    streamingText  string | null  — current partial AI token stream
// ─────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import { createSocket, WS_STATUS } from "../utils/socket";
import { addMessage, upsertRoom } from "../utils/chatStorage";

export function useWebSocket({
  roomId,
  onNewMessage,
  onRoomNameUpdate,
  onRoomIdReceived,
}) {
  const socketRef = useRef(null);
  const [wsStatus, setWsStatus] = useState(WS_STATUS.CLOSED);
  const [streamingText, setStreamingText] = useState(null);
  const streamBufferRef = useRef("");

  useEffect(() => {
    // roomId null ho toh bhi connect karo — backend ID dega
    if (socketRef.current) {
      socketRef.current.destroy();
      socketRef.current = null;
    }

    streamBufferRef.current = "";
    setStreamingText(null);

    const socket = createSocket(roomId);
    socketRef.current = socket;

    socket.on("status", setWsStatus);

    socket.on("token", (token) => {
      streamBufferRef.current += token;
      setStreamingText(streamBufferRef.current);
    });

    socket.on("done", () => {
      const fullText = streamBufferRef.current;
      streamBufferRef.current = "";
      setStreamingText(null);
      if (fullText.trim()) {
        const room = addMessage(roomId, {
          role: "assistant",
          content: fullText,
          ts: Date.now(),
        });
        if (room) onNewMessage(room.messages);
      }
    });

    socket.on("message", (data) => {
      streamBufferRef.current= "";
      setStreamingText(null);

      if (data.room_id) {
        onRoomIdReceived?.(data.room_id);
        return;
      }

      // type ke hisaab se content nikalo
      let content;
      if (data.type === "explanation" || data.type === "reply") {
        content = data.data;
      } else if (data.type === "chart") {
        // chart alag handle hoga
        const room = addMessage(roomId, {
          role: "assistant",
          type: "chart",
          data: data.data,
          ts: Date.now(),
        });
        if (room) onNewMessage(room.messages);
        return;
      } else {
        content = data.content ?? data.data ?? JSON.stringify(data);
      }

      const room = addMessage(roomId, {
        role: "assistant",
        content,
        ts: Date.now(),
      });
      if (room) onNewMessage(room.messages);
    });

    socket.on("error", (msg) => {
      streamBufferRef.current = "";
      setStreamingText(null);
      const room = addMessage(roomId, {
        role: "error",
        content: `Error: ${msg}`,
        ts: Date.now(),
      });
      if (room) onNewMessage(room.messages);
    });

    return () => {
      socket.destroy();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (!socketRef.current) return;

      const userMsg = { role: "user", content: text, ts: Date.now() };
      const updatedRoom = addMessage(roomId, userMsg);

      if (updatedRoom) {
        if (
          updatedRoom.messages.filter((m) => m.role === "user").length === 1
        ) {
          updatedRoom.name = text.length > 36 ? text.slice(0, 36) + "…" : text;
          upsertRoom(updatedRoom);
          onRoomNameUpdate?.(roomId, updatedRoom.name);
        }
        onNewMessage(updatedRoom.messages);
      }

      streamBufferRef.current = "";
      setStreamingText(null);
      socketRef.current.sendMessage(text);
    },
    [roomId, onNewMessage, onRoomNameUpdate],
  );

  return { wsStatus, sendMessage, streamingText };
}
