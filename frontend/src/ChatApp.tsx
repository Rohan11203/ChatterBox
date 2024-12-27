import { Link } from "react-router-dom"

const ChatApp = () => {
  return (
    <div>
      Welcome To Chatter Box
      <Link to="/join">Join</Link>
      <Link to="/create">Create</Link>
    </div>
  )
}
export default ChatApp