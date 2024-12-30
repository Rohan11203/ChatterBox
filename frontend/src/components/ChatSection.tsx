import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/ContexProvider";
import { useNavigate } from "react-router-dom";

interface Chat {
  username: string;
  content: string;
  timestamp: string
}

interface ChatState{
  messages: Chat[];
  connected: boolean;
}
const ChatSection = () => {
  const { users,wsRef,username } = useStore();
  const [chatState,setchatState] = useState<ChatState>({
    messages: [],
    connected: false
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate()
  // Handle new incoming chat messages
  const handleChat = (data: Chat) => {
    setchatState((prev) => ({
      ...prev,
      messages: [...prev.messages, data],
    }));

    if (inputRef.current) {
      inputRef.current.value = ""; 
    }
  };

  const onsendMessage = () => {
    const message = inputRef.current?.value.trim();

    if(wsRef.current?.readyState !== WebSocket.OPEN){
      console.log("Websocket is not connected");
      return;
    }
    
      wsRef.current?.send(JSON.stringify({
        "type": "message",
        "content": message
      }));
  
    }

    const onLeaveRoom = () => {
      if(wsRef.current?.readyState === WebSocket.OPEN){
        wsRef.current.close();
      }
      setchatState({
        messages: [],
        connected: false
      })
      navigate("/")
    }
    useEffect(() => {
      if(!wsRef.current) return;

      const onMessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        handleChat(data);
      }

      const onClose = () => {
        setchatState((prev) => ({...prev, connected: false}))
      }

      wsRef.current.addEventListener("message", onMessage);
      wsRef.current.addEventListener("close", onClose);

      return () => {
        wsRef.current?.removeEventListener("message", onMessage);
        wsRef.current?.removeEventListener("close", onClose);
      }
    },[wsRef])

    if(!users || users.length === 0){
      return <div>No users in the room.</div>;
    }

  return ( 
    <div className="bg-black h-screen flex flex-col items-center justify-center text-white p-5 space-y-6">
  {/* Logo */}
  <div className="text-4xl font-bold text-purple-400 mb-4">
    Chat Space
  </div>

  {/* Users Section */}
  <div className="bg-purple-600 rounded-lg p-4 shadow-md w-full max-w-sm">
    <h2 className="text-lg font-semibold mb-3">Users in Room</h2>
    <ul className="space-y-2">
      {users.map((user, index) => (
        <li key={index} className="bg-purple-800 p-2 rounded-md text-center">
          {user}
        </li>
      ))}
    </ul>
  </div>

  {/* Chat Messages Section */}
  <div className="bg-gray-800 rounded-lg p-4 shadow-md w-full max-w-lg h-[300px] overflow-y-auto">
    {chatState.messages.length > 0 ? (
      chatState.messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-4 flex ${
            msg.username === username ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs p-3 rounded-lg ${
              msg.username === username
                ? "bg-green-600 text-white text-right"
                : "bg-blue-600 text-white text-left"
            }`}
          >
            <p className="font-semibold">
              {msg.username === username ? "You" : msg.username}
            </p>
            <p>{msg.content}</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No messages yet. Start the conversation!</p>
    )}
  </div>

  {/* Input & Actions Section */}
  <div className="flex items-center space-x-4 w-full max-w-lg">
    <input
      ref={inputRef}
      className="bg-purple-700 border-2 border-purple-400 p-3 text-white rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
      type="text"
      placeholder="Type your message..."
    />
    <button
      className="bg-blue-500 p-3 rounded-lg text-white font-semibold hover:bg-blue-600"
      onClick={onsendMessage}
    >
      Send
    </button>
    <button
      className="bg-red-500 p-3 rounded-lg text-white font-semibold hover:bg-red-600"
      onClick={onLeaveRoom}
    >
      Leave
    </button>
  </div>
</div>

  
  )
}

export default ChatSection;