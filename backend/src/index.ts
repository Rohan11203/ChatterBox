import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';

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

const clients: Map<WebSocket, Client> = new Map();
const rooms: Map<string, Set<WebSocket>> = new Map();

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('message', (message: string) => {
        const data = JSON.parse(message.toString());
        handleMessage(ws, data);
    });

    ws.on('close', () => {
        // handleLeaveRoom(ws);
        clients.delete(ws);
    });
});

function handleMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
        case 'join':
            // handleJoinRoom(ws, data);
            break;
        case 'message':
            // handleChatMessage(ws, data);
            break;
        case 'leave':
            // handleLeaveRoom(ws);
            break;
    }
}

// function handleJoinRoom(ws,data){}
// function handleChatMessage(){}
// function handleLeaveRoom(){}
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});