import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
const server = createServer(app);
const ws = new WebSocketServer({ server })
const PORT = 3001;

app.use(express.json());
app.use(cors());

interface Client {
    ws: WebSocket;
    usernames: string;
    roomId: string;
}

interface ChatMessage {
    type: 'message';
    username?: string;
    content?: string;
    users?: string[];
}
const clients: Map<WebSocket, Client> = new Map();
const rooms: Map<string, Set<WebSocket>> = new Map();

ws.on('connection', (ws: WebSocket) =>{
    console.log('new Client connected');

    ws.on('message', (message: string) =>{
        const data = JSON.parse(message.toString());
        handleMessage(ws, data);
    })

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

function handleMessage(ws: WebSocket, data: any): void{
    switch (data.type) {
        case 'join':
            console.log('joining');
            break;
        case 'chat':
            console.log('Chatting');
            break;
        case 'leave':
            console.log('Leaving');
            break;
        default:
            console.log('Unknown message');
            break;
    }
}

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
})