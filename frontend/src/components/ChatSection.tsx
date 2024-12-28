import { useRef, useState } from "react";
import { useStore } from "../store/ContexProvider";

interface Chat {
  content: string;
  timestamp: string
}
const ChatSection = () => {
  const { users,wsRef } = useStore();
  const [chats,setChats] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!users || users.length === 0) {
    return <div>No users in the room.</div>;
  }

  function handleChat(data: Chat){
    
    
      let content = data.content;
      setChats((prev) => [...prev, content])
      console.log("chats", chats);
      inputRef.current.value = ""
  }

  const onsendMessage = () => {
    if(!wsRef.current?.readyState){
      console.log("Bro there is error")
    }
      wsRef.current?.send(JSON.stringify({
        "type": "message",
        "content": inputRef.current?.value
      }));
      wsRef.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        handleChat(data)
        
        console.log(data)
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
        chats.map((chat,index) => (
          <p key={index}>{chat}</p>
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