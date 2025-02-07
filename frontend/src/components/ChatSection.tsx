import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/ContexProvider";
import { useNavigate } from "react-router-dom";
import { Send, LogOut, Users, MessageSquare, User } from "lucide-react";

interface Chat {
  username: string;
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: Chat[];
  connected: boolean;
}

const ChatSection = () => {
  const { users, wsRef, username } = useStore();
  const [chatState, setchatState] = useState<ChatState>({
    messages: [],
    connected: false
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (!message) return;

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.log("Websocket is not connected");
      return;
    }

    wsRef.current?.send(JSON.stringify({
      "type": "message",
      "content": message
    }));
  };

  const onLeaveRoom = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setchatState({
      messages: [],
      connected: false
    });
    navigate("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    if (!wsRef.current) return;

    const onMessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      handleChat(data);
    };

    const onClose = () => {
      setchatState((prev) => ({ ...prev, connected: false }));
    };

    wsRef.current.addEventListener("message", onMessage);
    wsRef.current.addEventListener("close", onClose);

    return () => {
      wsRef.current?.removeEventListener("message", onMessage);
      wsRef.current?.removeEventListener("close", onClose);
    };
  }, [wsRef]);

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-300">
        <Users className="mr-2" /> No users in the room.
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl">
          <MessageSquare className="w-6 h-6" />
          Chat Space
        </div>
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Leave Room
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Users Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 text-gray-200 font-semibold">
              <Users className="w-5 h-5" />
              Online Users ({users.length})
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {users.map((user, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 rounded-lg mb-2 transition-colors ${
                  user === username 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="truncate">{user === username ? `${user} (You)` : user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatState.messages.length > 0 ? (
              chatState.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.username === username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xl rounded-lg px-4 py-2 ${
                      msg.username === username
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {msg.username === username ? "You" : msg.username}
                    </div>
                    <div className="break-words">{msg.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <MessageSquare className="w-12 h-12" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                className="flex-1 bg-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && onsendMessage()}
              />
              <button
                onClick={onsendMessage}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;