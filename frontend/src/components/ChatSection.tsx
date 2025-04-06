import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/ContexProvider";
import { useNavigate } from "react-router-dom";
import { Send, Copy, Users, SmilePlus } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface Chat {
  username: string;
  content: string;
  timestamp: string;
  profilePhoto?: string;
  type?: string; // Add type to differentiate system and user messages
}

interface ChatState {
  messages: Chat[];
  connected: boolean;
  initialized: boolean; // Add flag to track initial connection
}

const ChatSection = () => {
  const { users, wsRef, username } = useStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    connected: false,
    initialized: false,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const text = input.value;
      const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
      
      input.value = newText;
      // Move cursor after inserted emoji
      const newCursorPos = start + emojiData.emoji.length;
      input.selectionStart = newCursorPos;
      input.selectionEnd = newCursorPos;
      input.focus();
    }
  };

  // Generate a Robohash URL based on username
  const getRobohashUrl = (username: string) => {
    // Create a deterministic but unique hash based on the username
    // This ensures the same user always gets the same avatar
    return `https://robohash.org/${encodeURIComponent(username)}?set=set3`;
  };

  const handleChat = (data: Chat) => {
    // Prevent duplicate messages during initialization
    if (
      !chatState.initialized &&
      data.type === "system" &&
      data.content === ""
    ) {
      return;
    }

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, data],
      initialized: true,
    }));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const sendMessage = () => {
    const message = inputRef.current?.value.trim();
    if (!message) return;

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not connected");
      return;
    }

    wsRef.current?.send(
      JSON.stringify({
        type: "message",
        content: message,
      })
    );
  };

  const leaveRoom = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setChatState({
      messages: [],
      connected: false,
      initialized: false,
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

      // Filter out empty messages that might be caused by re-rendering
      if (data.content !== undefined && data.content !== null) {
        handleChat(data);
      }
    };

    const onClose = () => {
      setChatState((prev) => ({ ...prev, connected: false }));
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111111] rounded-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-gray-200">Room </span>
            <button
              className="text-gray-400 hover:text-gray-200"
              onClick={() => navigator.clipboard.writeText("123")}
            >
              <Copy size={16} />
            </button>
          </div>
          <button
            onClick={leaveRoom}
            className="px-4 py-1 bg-[#9333EA] hover:bg-[#A855F7] text-white rounded-md text-sm"
          >
            Exit
          </button>
        </div>

        {/* Chat Area - Fixed height with scrolling */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100% - 120px)" }}
        >
          {chatState.messages.map((msg, index) => {
            // Skip rendering empty messages
            if (!msg.content) return null;

            return (
              <div
                key={index}
                className={`flex items-start gap-2 mb-4 ${
                  msg.username === username ? "justify-end" : "justify-start"
                }`}
              >
                {msg.username !== username && (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {msg.profilePhoto ? (
                      <img
                        src={msg.profilePhoto}
                        alt={`${msg.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={getRobohashUrl(msg.username || `user-${index}`)}
                        alt={`${msg.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {msg.username !== username && (
                    <span className="text-xs text-gray-400 ml-1">
                      {msg.username}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-sm break-words ${
                      msg.username === username
                        ? "bg-[#9333EA] text-white"
                        : "bg-[#1A1A1A] text-gray-200"
                    }`}
                  >
                    <span>{msg.content}</span>
                  </div>
                </div>
                {msg.username === username && (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {msg.profilePhoto ? (
                      <img
                        src={msg.profilePhoto}
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={getRobohashUrl(username)}
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-800 relative">
          <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-xl px-4 py-2">
            <button
              className="text-[#9333EA] hover:text-[#A855F7]"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <SmilePlus size={20} />
            </button>
            <input
              ref={inputRef}
              type="text"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Enter a message"
              className="flex-1 bg-transparent text-gray-200 outline-none placeholder:text-gray-500"
            />
            <button
              onClick={sendMessage}
              className="text-[#9333EA] hover:text-[#A855F7]"
            >
              <Send size={20} />
            </button>
          </div>
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-0 z-10">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                searchDisabled
                skinTonesDisabled
                width={300}
                height={400}
                theme={Theme.DARK}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
