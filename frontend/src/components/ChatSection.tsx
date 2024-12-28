import { useStore } from "../store/ContexProvider";

const ChatSection = () => {
  const { users,wsRef } = useStore();

  if (!users || users.length === 0) {
    return <div>No users in the room.</div>;
  }

  const onsendMessage = () => {
    if(!wsRef.current?.readyState){
      console.log("Bro there is error")
    }
      wsRef.current?.send(JSON.stringify({
        "type": "message",
        "content": "labda"
      }));
      wsRef.current.onmessage = (e) => {
        console.log(e.data)
      }
    
  }
  return ( 
    <div  className="bg-slate-500 h-screen grid items-center justify-center" >
     <div className="bg-blue-700 rounded-md p-2">
     <h2>Users in Room</h2>
     <ul>
      {
        users.map((user,index) => (
          <li key={index}>{user}</li>
        ))}
     </ul>
     </div>
     <div className="bg-blue-300 h-[300px]">
      chat will come here
     </div>

     <div>
      <input className="bg-violet-400 border-2 p-2 text-black rounded-xl " type="text"></input>
      <button className="bg-blue-500 p-2 rounded-xl" onClick={onsendMessage}>Send</button>
     </div>
    </div>
  )
}

export default ChatSection;