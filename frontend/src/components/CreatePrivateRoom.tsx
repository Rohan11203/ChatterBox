import React, { useState } from "react";
import { useStore } from "../store/ContexProvider";
import { useNavigate } from "react-router-dom";

interface CreatePrivateRoomProps {
  onClose: () => void;
}

const CreatePrivateRoom: React.FC<CreatePrivateRoomProps> = ({ onClose }) => {
  const { wsRef, username, isConnected, setUsername } = useStore();
  const [roomName, setRoomName] = useState<string>("");
  const [allowedUsers, setAllowedUsers] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError("Socket not connected");
      return;
    }

    ws.send(
      JSON.stringify({
        type: "createPrivateRoom",
        roomId: roomName,
        username: username,
        allowedUsers: allowedUsers
          .split(",")
          .map((u) => u.trim())
          .filter((u) => u),
      })
    );
    onClose();
    navigate("/chat")
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Private Room</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleCreateRoom}>
        <div className="mb-4">

        <label
            htmlFor="username"
            className="block text-gray-700 font-medium mb-2"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="text-black w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />


          <label htmlFor="roomName" className="block text-gray-700 font-medium mb-2">
            Room ID:
          </label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="text-black w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          
        </div>
        <div className="mb-4">
          <label htmlFor="allowedUsers" className="block text-gray-700 font-medium mb-2">
            Allowed Users:
          </label>
          <textarea
            id="allowedUsers"
            value={allowedUsers}
            onChange={(e) => setAllowedUsers(e.target.value)}
            placeholder="Enter usernames separated by commas"
            rows={3}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-gray-500 text-sm mt-1">
            Enter usernames of people who can join this room (comma separated). You will automatically be added to the allowed users.
          </p>
        </div>
        <div className="flex space-x-3 mt-6">
          <button
            type="submit"
            disabled={!isConnected}
            className={`px-4 py-2 rounded ${
              isConnected ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isConnected ? "Create Room" : "Connecting…"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrivateRoom;