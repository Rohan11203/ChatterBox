import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

// Match the backend ChatMessage interface
interface ChatMessage {
  type: 'message' | 'system' | 'userList' | 'error';
  username?: string;
  content?: string;
  timestamp?: string;
  users?: string[];
}

// Context props with added methods for chat functionality
interface StoreContextProps {
  wsRef: React.MutableRefObject<WebSocket | null>;
  isConnected: boolean;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  users: string[];
  roomId: string;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  messages: ChatMessage[];
  setUsers: React.Dispatch<React.SetStateAction<string[]>>;
  isPrivateRoomModalOpen: boolean;
  setIsPrivateRoomModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  
  // Methods to interact with WebSocket
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
  leaveRoom: () => void;
  createPrivateRoom: (roomId: string, allowedUsers: string[]) => void;
  updateAllowedUsers: (roomId: string, allowedUsers: string[]) => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPrivateRoomModalOpen, setIsPrivateRoomModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomId, setRoomId] = useState<string>("");

  // Function to join a chat room
  const joinRoom = useCallback((roomToJoin: string) => {
    if (!wsRef.current || !isConnected || !username) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'join',
      username,
      roomId: roomToJoin
    }));
    
    setRoomId(roomToJoin);
    // Clear previous messages when joining a new room
    setMessages([]);
  }, [isConnected, username]);

  // Function to send a chat message
  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || !isConnected || !roomId) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content
    }));
  }, [isConnected, roomId]);

  // Function to leave the current room
  const leaveRoom = useCallback(() => {
    if (!wsRef.current || !isConnected || !roomId) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'leave'
    }));
    
    setRoomId("");
    setUsers([]);
    setMessages([]);
  }, [isConnected, roomId]);

  // Function to create a private room
  const createPrivateRoom = useCallback((newRoomId: string, allowedUsers: string[]) => {
    if (!wsRef.current || !isConnected || !username) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'createPrivateRoom',
      roomId: newRoomId,
      allowedUsers
    }));
  }, [isConnected, username]);

  // Function to update allowed users in a private room
  const updateAllowedUsers = useCallback((roomToUpdate: string, allowedUsers: string[]) => {
    if (!wsRef.current || !isConnected) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'updateAllowedUsers',
      roomId: roomToUpdate,
      allowedUsers
    }));
  }, [isConnected]);

  // Set up WebSocket connection and message handlers
  useEffect(() => {
    // Using the correct port from the backend (3001)
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket OPEN");
      setIsConnected(true);
    };
    
    ws.onclose = () => {
      console.log("WebSocket CLOSED");
      setIsConnected(false);
    };
    
    ws.onerror = (e) => {
      console.error("WebSocket ERROR", e);
      setErrorMessage("WebSocket encountered an error");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data) as ChatMessage;
      
      switch (data.type) {
        case "userList":
          if (Array.isArray(data.users)) {
            setUsers(data.users);
          }
          break;
          
        case "message":
          setMessages(prev => [...prev, data]);
          break;
          
        case "system":
          setMessages(prev => [...prev, data]);
          break;
          
        case "error":
          setErrorMessage(data.content || "An error occurred");
          break;
          
        default:
          console.log("Unhandled message type:", data);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Automatically rejoin room if disconnected and reconnected
  return (
    <StoreContext.Provider
      value={{
        wsRef,
        roomId,
        setRoomId,
        isConnected,
        username,
        setUsername,
        users,
        setUsers,
        messages,
        isPrivateRoomModalOpen,
        setIsPrivateRoomModalOpen,
        errorMessage,
        setErrorMessage,
        joinRoom,
        sendMessage,
        leaveRoom,
        createPrivateRoom,
        updateAllowedUsers
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
};