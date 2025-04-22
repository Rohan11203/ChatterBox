// JoinPrivateRoom.tsx
import React, { useState } from "react";
import { useStore } from "../store/ContexProvider";
import { useNavigate } from "react-router-dom";

interface JoinPrivateRoomProps {
  onClose: () => void;
}

const JoinPrivateRoom: React.FC<JoinPrivateRoomProps> = ({ onClose }) => {
  const { wsRef, username, setUsername } = useStore();
  const [privateRoomId, setPrivateRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!privateRoomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket connection is not open");
      return;
    }

    // Send the join room message
    wsRef.current.send(
      JSON.stringify({
        type: "join",
        username,
        roomId: privateRoomId,
      })
    );

    navigate("/chat");
    // Close the join room dialog
    onClose();
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Join Private Room
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleJoinRoom}>
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

          
          <label
            htmlFor="privateRoomId"
            className="block text-gray-700 font-medium mb-2"
          >
            Private Room ID:
          </label>
          <input
            type="text"
            id="privateRoomId"
            value={privateRoomId}
            onChange={(e) => setPrivateRoomId(e.target.value)}
            placeholder="Enter private room ID"
            className="text-black w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          
          <p className="text-gray-500 text-sm mt-1">
            You can only join private rooms if you have been added to the
            allowed users list.
          </p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Join Room
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

export default JoinPrivateRoom;
