import React, { createContext, ReactNode, useContext, useRef, useState } from "react";

interface StoreContextProps {
  wsRef: React.MutableRefObject<WebSocket | null>;
  username: React.MutableRefObject<HTMLInputElement | null>;
  roomId: React.MutableRefObject<HTMLInputElement | null>;
  users: string[],
  setUsers: React.Dispatch<React.SetStateAction<string[]>>
}
const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: {children: ReactNode}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const username = useRef<HTMLInputElement | null>(null);
  const roomId = useRef<HTMLInputElement | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  

  return (
    <StoreContext.Provider
      value={{
        wsRef,
        username,
        roomId,
        users,
        setUsers
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
