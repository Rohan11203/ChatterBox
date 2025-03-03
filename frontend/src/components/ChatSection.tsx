import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/ContexProvider";
import { useNavigate } from "react-router-dom";
import {
  Send,
  LogOut,
  Users,
  MessageSquare,
  User,
  SmilePlus,
  Copy,
} from "lucide-react";

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
    connected: false,
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

    wsRef.current?.send(
      JSON.stringify({
        type: "message",
        content: message,
      })
    );

    console.log(chatState);
  };

  const onLeaveRoom = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setchatState({
      messages: [],
      connected: false,
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
    <div>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#111111] rounded-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-gray-200">Room ID: 56011716</span>
              <button className="text-gray-400 hover:text-gray-200">
                <Copy size={16} />
              </button>
            </div>
            <button
              onClick={onLeaveRoom}
              className="px-4 py-1 bg-[#9333EA] hover:bg-[#A855F7] text-white rounded-md text-sm"
            >
              Exit
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 min-h-[500px] overflow-y-auto">
            <div className="flex justify-end items-start gap-2">
                <div className="flex-1 p-4 min-h-[500px] overflow-y-auto">
                  {chatState.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 mb-4 ${
                        msg.username === username
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {msg.username && msg.username !== username && (
                        <div className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center text-white text-sm">
                          {msg.username}
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        {msg.username !== username && (
                          <span className="text-xs text-gray-400 ml-1">
                            {msg.username}
                          </span>
                        )}
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl max-w-sm break-words
                  ${
                    msg.username === username
                      ? "bg-[#9333EA] text-white"
                      : "bg-[#1A1A1A] text-gray-200"
                  }`}
                        >
                          <span>{msg.content}</span>
                        </div>
                      </div>
                      {msg.username === username && (
                        <div className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center text-white text-sm">
                          {msg.username}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

              <img
                src="/placeholder.svg?height=32&width=32"
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl px-4 py-2">
              <button className="text-[#9333EA] hover:text-[#A855F7]">
                <SmilePlus size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                onKeyPress={(e) => e.key === "Enter" && onsendMessage}
                placeholder="Enter a message"
                className="flex-1 bg-transparent text-gray-200 outline-none placeholder:text-gray-500"
              />
              <button
                onClick={onsendMessage}
                className="text-[#9333EA] hover:text-[#A855F7]"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
