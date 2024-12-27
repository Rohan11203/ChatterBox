import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const username = useRef(null);
  const roomId = useRef(null);
  const navigate = useNavigate();

  const connectToRoom = () => {
    wsRef.current = new WebSocket("ws://localhost:3001");
    wsRef.current.onopen = () => {
      console.log("Connected to server");
      console.log(username.current.value)
      console.log(roomId.current.value)
      wsRef.current?.send(
        JSON.stringify({
          type: "join",
          username: username.current.value,
          roomId: roomId.current.value,
        })
      );
      console.log("after sending to ws backend")
      navigate("/chat")
    };
    
  };

  return (
    <div className="flex bg-red-300 h-screen items-center justify-center">
      <div className="h-34 border-1 border-blue-800 rounded grid">
        <input
          className="p-5 border-b-2"
          ref={username}
          type="text"
          placeholder="Username"
        ></input>
        <input
          className="p-5"
          ref={roomId}
          type="text"
          placeholder="RoomId"
        ></input>
        <button className="p-2 bg-blue-600"  onClick = {connectToRoom} type="submit">
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
