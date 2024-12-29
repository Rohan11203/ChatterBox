import { useNavigate } from "react-router-dom";
import { useStore } from "../store/ContexProvider";

interface MessageData {
  content: string;
  timestamp: string;
  users: [];

}
const JoinRoom = () => {
  const navigate = useNavigate();
  const {wsRef, username,setUsername, roomId, setUsers } = useStore();

  function handleMessage(data: MessageData) {
    if (Array.isArray(data.users)) {
      setUsers(data.users);
      console.log("Updated users array:", data.users);
    } else {
      console.warn("Received data does not contain a valid users array:", data);
    }
  }

  const connectToRoom = () => {
    wsRef.current = new WebSocket("ws://localhost:3001");
    wsRef.current.onopen = () => {
      console.log("Connected to server");
      wsRef.current?.send(
        JSON.stringify({
          type: "join",
          username: username,
          roomId: roomId.current?.value,
        })
      );
      wsRef.current!.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if(data.type === 'userList'){
          handleMessage(data)
        }
      }

      wsRef.current!.onerror = () => {
        console.log("Ws Error")
      }

      navigate("/chat")
    };
    
  };

  return (
    <div className="flex bg-red-300 h-screen items-center justify-center">
      <div className="h-34 border-1 border-blue-800 rounded grid">
        <input
          className="p-5 border-b-2"
          onChange={(e)=> {setUsername(e.target.value)}}
          type="text"
          placeholder="Username"
        ></input>
        <input
          className="p-5"
          ref={roomId}
          type="text"
          placeholder="RoomId"
        ></input>
        <button className="p-2 bg-blue-600"  onClick = {connectToRoom} type="submit">
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
