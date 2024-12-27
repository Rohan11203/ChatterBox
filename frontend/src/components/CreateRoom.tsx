const CreateRoom = () => {
  return (
      <div className="flex bg-red-300 h-screen items-center justify-center">
        <div className="h-34 border-1 border-blue-800 rounded grid">
        <input className="p-5 border-b-2" type="text" placeholder="Username"></input>
        <input className="p-5" type="text" placeholder="RoomId"></input>
        <button className="p-2 bg-blue-600" type="submit">Join Room</button>
        </div>
      </div>
  )
}

export default CreateRoom;