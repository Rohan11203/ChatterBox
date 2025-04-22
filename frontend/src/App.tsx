import './App.css'
import ChatApp from './ChatApp'
import JoinRoom from './components/JoinRoom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ChatSection from './components/ChatSection'
import { StoreProvider, useStore } from './store/ContexProvider'
import PrivateRoomModal from './components/PrivateRoomModal'


function App() {
  const { isPrivateRoomModalOpen, setIsPrivateRoomModalOpen } = useStore();
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<ChatApp />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/chat" element={<ChatSection />} />
      <Route path="/private-room" element={<PrivateRoomModal isOpen={isPrivateRoomModalOpen} onClose={() => { setIsPrivateRoomModalOpen(false)}}/>} />

    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
