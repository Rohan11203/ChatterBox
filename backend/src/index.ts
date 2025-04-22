import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// ----- Types -----
interface Client {
  ws: WebSocket;
  username: string;
  roomId: string;
}

interface ChatMessage {
  type: 'message' | 'system' | 'userList' | 'error';
  username?: string;
  content?: string;
  timestamp?: string;
  users?: string[];
}

interface Room {
  id: string;
  isPrivate: boolean;
  allowedUsers: string[];
}

// ----- Server Setup -----
const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// ----- In-Memory Stores -----
const clients: Map<WebSocket, Client> = new Map();
const rooms: Map<string, Set<WebSocket>> = new Map();
const roomSettings: Map<string, Room> = new Map();

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      handleMessage(ws, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    handleLeaveRoom(ws);
    clients.delete(ws);
  });
});

// ----- Message Router -----
function handleMessage(ws: WebSocket, data: any): void {
  switch (data.type) {
    case 'join':
      handleJoinRoom(ws, data);
      break;
    case 'message':
      handleChatMessage(ws, data);
      break;
    case 'leave':
      handleLeaveRoom(ws);
      break;
    case 'createPrivateRoom':
      handleCreatePrivateRoom(ws, data);
      break;
    case 'updateAllowedUsers':
      handleUpdateAllowedUsers(ws, data);
      break;
    default:
      sendErrorToClient(ws, 'Unknown message type');
  }
}

// ----- Create a Private Room -----
function handleCreatePrivateRoom(
  ws: WebSocket,
  data: { roomId: string; allowedUsers: string[]; username: string }
): void {
  const { roomId, allowedUsers, username } = data;

  // Persist private room settings
  roomSettings.set(roomId, {
    id: roomId,
    isPrivate: true,
    // ensure unique list + creator
    allowedUsers: Array.from(new Set([...allowedUsers, username])),
  });

  console.log(`Private room created: ${roomId}`);

  // Automatically join the creator
  handleJoinRoom(ws, { username, roomId });
}

// ----- Join a Room -----
function handleJoinRoom(
  ws: WebSocket,
  data: { username: string; roomId: string }
): void {
  const { username, roomId } = data;
  console.log(`Joining room: ${roomId} as ${username}`);

  // If already in a different room, leave that first
  if (clients.has(ws)) {
    const prev = clients.get(ws)!;
    if (prev.roomId !== roomId) {
      handleLeaveRoom(ws);
    }
  }

  // Check private room permissions
  const setting = roomSettings.get(roomId);
  if (setting?.isPrivate && !setting.allowedUsers.includes(username)) {
    sendErrorToClient(ws, "You don't have permission to join this private room");
    return;
  }

  // Ensure room exists
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
    // If no settings, create as public
    if (!roomSettings.has(roomId)) {
      roomSettings.set(roomId, { id: roomId, isPrivate: false, allowedUsers: [] });
    }
  }

  // Add to room
  rooms.get(roomId)!.add(ws);
  clients.set(ws, { ws, username, roomId });

  // Notify others
  broadcastToRoom(roomId, {
    type: 'system',
    content: `${username} joined the room`,
    timestamp: new Date().toISOString(),
  });

  // Send updated user list
  updateRoomUserList(roomId);
  console.log(`${username} joined room ${roomId}`);
}

// ----- Leave a Room -----
function handleLeaveRoom(ws: WebSocket): void {
  const client = clients.get(ws);
  if (!client) return;

  const { username, roomId } = client;
  const room = rooms.get(roomId);
  if (!room) return;

  // Remove from room set
  room.delete(ws);

  if (room.size === 0) {
    // Delete room container
    rooms.delete(roomId);
    // Only delete settings if public
    const setting = roomSettings.get(roomId);
    if (!setting || !setting.isPrivate) {
      roomSettings.delete(roomId);
    }
  } else {
    // Notify remaining users
    broadcastToRoom(roomId, {
      type: 'system',
      content: `${username} left the room`,
      timestamp: new Date().toISOString(),
    });
    updateRoomUserList(roomId);
  }
}

// ----- Chat Message -----
function handleChatMessage(
  ws: WebSocket,
  data: { content: string }
): void {
  const client = clients.get(ws);
  if (!client) return;

  broadcastToRoom(client.roomId, {
    type: 'message',
    username: client.username,
    content: data.content,
    timestamp: new Date().toISOString(),
  });
}

// ----- Update Allowed Users for Private Room -----
function handleUpdateAllowedUsers(
  ws: WebSocket,
  data: { roomId: string; allowedUsers: string[] }
): void {
  const client = clients.get(ws);
  if (!client) return;

  const room = roomSettings.get(data.roomId);
  if (!room) {
    sendErrorToClient(ws, "Room does not exist");
    return;
  }

  // Only existing allowed users can update
  if (!room.allowedUsers.includes(client.username)) {
    sendErrorToClient(ws, "You don't have permission to update this room");
    return;
  }

  // Persist updated list (keep updater)
  room.allowedUsers = Array.from(
    new Set([...data.allowedUsers, client.username])
  );

  broadcastToRoom(data.roomId, {
    type: 'system',
    content: `Allowed users list has been updated`,
    timestamp: new Date().toISOString(),
  });
}

// ----- Utility Functions -----
function sendErrorToClient(ws: WebSocket, errorMessage: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'error',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

function broadcastToRoom(roomId: string, message: ChatMessage): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const str = JSON.stringify(message);
  for (const clientWs of room) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(str);
    }
  }
}

function updateRoomUserList(roomId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const users = Array.from(room)
    .map(ws => clients.get(ws)?.username)
    .filter(u => u) as string[];

  broadcastToRoom(roomId, {
    type: 'userList',
    users,
  });
}

// ----- Start Server -----
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
