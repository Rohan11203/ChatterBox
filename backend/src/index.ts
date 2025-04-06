import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

interface Client {
    ws: WebSocket;
    username: string;
    roomId: string;
}

interface ChatMessage {
    type: 'message' | 'system' | 'userList';
    username?: string;
    content?: string;
    timestamp?: string;
    users?: string[];
}

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Store connected clients and rooms
const clients: Map<WebSocket, Client> = new Map();
const rooms: Map<string, Set<WebSocket>> = new Map();

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('message', (message: string) => {
        const data = JSON.parse(message.toString());
        handleMessage(ws, data);
    });

    ws.on('close', () => {
        handleLeaveRoom(ws);
        clients.delete(ws);
    });
});

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
    }
}

function handleJoinRoom(ws: WebSocket, data: { username: string; roomId: string }): void {
    const { username, roomId } = data;
    console.log("From Frontend",data)
    // Remove from previous room
    if (clients.has(ws)) {
        handleLeaveRoom(ws);
    }

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId)!;
    room.add(ws);
    clients.set(ws, { ws, username, roomId });

    broadcastToRoom(roomId, {
        type: 'system',
        content: `${username} joined the room`,
        timestamp: new Date().toISOString()
    });

    // Send room user list
    updateRoomUserList(roomId);
    console.log("all done bro")
}

function handleLeaveRoom(ws: WebSocket): void {
    const client = clients.get(ws);
    if (!client) return;

    const { username, roomId } = client;
    const room = rooms.get(roomId);

    if (room) {
        room.delete(ws);

        // Delete room if empty
        if (room.size === 0) {
            rooms.delete(roomId);
        } else {
            
            broadcastToRoom(roomId, {
                type: 'system',
                content: `${username} left the room`,
                timestamp: new Date().toISOString()
            });
            updateRoomUserList(roomId);
        }
    }
}

function handleChatMessage(ws: WebSocket, data: { content: string }): void {
    const client = clients.get(ws);
    if (!client) return;
    console.log("client called",data)

    broadcastToRoom(client.roomId, {
        type: 'message',
        username: client.username,
        content: data.content,
        timestamp: new Date().toISOString()
    });
}

function broadcastToRoom(roomId: string, message: ChatMessage): void {
    const room = rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

function updateRoomUserList(roomId: string): void {
    const room = rooms.get(roomId);
    if (!room) return;

    const userList = Array.from(room)
        .map(ws => clients.get(ws)?.username)
        .filter(username => username !== undefined);

    broadcastToRoom(roomId, {
        type: 'userList',
        users: userList
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});