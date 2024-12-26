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
    username: string;
    roomId: string;
}

interface ChatMessage {
    type: 'message' | 'system';
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
            handleJoin(ws, data);
            console.log('joining');
            break;
        case 'chat':
            console.log('Chatting');
            break;
        case 'leave':
            handleaveRoom(ws)
            console.log('Leaving');
            break;
        default:
            console.log('Unknown message');
            break;
    }
}

function handleJoin(ws: WebSocket, data: {username: string , roomId: string}): void{
    const { username, roomId } = data;
    
    if(clients.has(ws)){
        handleaveRoom(ws)
        console.log("Leaving previous room")
    }

    if(!rooms.has(roomId)){
        rooms.set(roomId, new Set());
    }
    const room = rooms.get(roomId)
    room?.add(ws)
    clients.set(ws, { ws, username, roomId });
    console.log(`UserJoined ${username} room ${roomId}`)
}

function handleaveRoom(ws: WebSocket): void{
    const client = clients.get(ws);

    if(!client) return;

    const { username, roomId } = client;
    const room = rooms.get(roomId);
    console.log(room)
    if(room){
        room.delete(ws);
        console.log("deleted")
        if(room.size === 0){
            rooms.delete(roomId);
        } else{
           broadCastToRoom(roomId, {
            type: "system",
            content: `${username} Left the room`
           })
        }
    }
    
}


function handleChatMessage(ws: WebSocket, data: { content: string, }): void{
    const client = clients.get(ws);
    if(!client) return;
    broadCastToRoom(client.roomId, {
       type: 'message',
       username: client.roomId,
       content: data.content, 
    });
}

function broadCastToRoom(roomId: string, message: ChatMessage):void{
    const room = rooms.get(roomId);
    if(!room) return;
    const messageStr = JSON.stringify(message);
    room.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(messageStr);
        }
    });
}

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
})