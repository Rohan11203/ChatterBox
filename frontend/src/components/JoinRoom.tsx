import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/ContexProvider";

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { wsRef, username, setUsername, roomId, isConnected, setRoomId } = useStore();

  const connectToRoom = () => {
    if (!username.trim()) return alert("Please enter a username");
    if (wsRef.current?.readyState !== WebSocket.OPEN)
      return alert("Still connecting…");

    wsRef.current.send(
      JSON.stringify({
        type: "join",
        username,
        roomId: roomId,
      })
    );
    navigate("/chat");
  };

  return (
    <div className="flex bg-black h-screen items-center justify-center">
      <div className="h-[350px] p-6 text-white w-[350px] border rounded-lg">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Join a Public Room</h1>
        </div>

        <div className="flex flex-col space-y-6">
          <input
            type="text"
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-black text-white rounded-md border-2 border-gray-600 focus:outline-none"
          />
          <input
            type="text"
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="p-2 bg-black text-white rounded-md border-2 border-gray-600 focus:outline-none"
          />
          <button
            onClick={connectToRoom}
            disabled={!isConnected}
            className={`p-2 rounded ${
              isConnected
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {isConnected ? "Join Room" : "Connecting…"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;