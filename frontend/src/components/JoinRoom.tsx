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
    wsRef.current = new WebSocket("https://chat-space-20a4.onrender.com");
    wsRef.current.onopen = () => {
      console.log("Connected to server");
      if(!username) {
        alert("Please enter a username")
        return;
      }
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
     <div className="flex bg-black h-screen  items-center justify-center">
      
      <div className="h-[350px] p-6 text-white w-[350px] border rounded-lg">
        <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Join a space</h1>
        </div>

        <div className="flex flex-col space-y-6">
          <input
            type="text"
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 bg-black text-white rounded-md border-2 border-gray-600 focus:outline-none"
          />
          <input
            type="text"
            ref={roomId}
            placeholder="Enter Room ID"
            className="p-2 bg-black text-white rounded-md border-2 border-gray-600 focus:outline-none"
          />
          <button
            onClick={connectToRoom}
            className="bg-[rgba(167,100,250,1)] text-black p-2 rounded-md hover:bg-[rgba(167,140,250,1)]"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
