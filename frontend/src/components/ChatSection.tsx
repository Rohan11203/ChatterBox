import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/ContexProvider";

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
  const [chats,setChats] = useState<ChatState>({
    messages: [],
    connected: false
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!users || users.length === 0) {
    return <div>No users in the room.</div>;
  }

function handleChat(data: Chat){
      setChats((prev) => ({
        ...prev,
        messages: [...prev.messages, data]
      }))
      console.log("This is chat state", chats);
      inputRef.current.value = '';
  }

  const onsendMessage = () => {
    if(!wsRef.current?.readyState){
      console.log("Bro there is error")
    }
    const message = inputRef.current?.value
      wsRef.current?.send(JSON.stringify({
        "type": "message",
        "content": message
      }));
      wsRef.current!.onmessage = (e) => {
        const data = JSON.parse(e.data);
        handleChat(data)
        
        console.log(data)
      }
      wsRef.current!.onclose = () => {
        setChats(prev => ({ ...prev, connected: false}))
      }
  }
  return ( 
    <div  className="bg-slate-500 h-screen grid items-center justify-center" >
     <div className="bg-blue-700 rounded-md p-2">
     <h2>Users in Room</h2>
     <ul>
      {
        users.map((user,index) => (
          <p key={index}>{user}</p>
        ))}
     </ul>
     </div>
     <div className="bg-blue-300 h-[300px]">
      
      {
        chats.messages.map((msg,idx) =>(
          <div key={idx}>
           <p className="font-semibold">
                  {msg.username === username ? 'You' : msg.username}
                </p>
                <p>{msg.content}</p>
          </div>
        ))
      }
     </div>

     <div>
      <input ref={inputRef} className="bg-violet-400 border-2 p-2 text-black rounded-xl " type="text"></input>
      <button className="bg-blue-500 p-2 rounded-xl" onClick={onsendMessage}>Send</button>
     </div>
    </div>
  )
}

export default ChatSection;