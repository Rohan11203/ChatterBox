import './App.css'
import ChatApp from './ChatApp'
import JoinRoom from './components/JoinRoom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ChatSection from './components/ChatSection'
import { StoreProvider } from './store/ContexProvider'



function App() {
 
  return (
    <>
    <BrowserRouter>
    <StoreProvider>
    <Routes>
      <Route path="/" element={<ChatApp />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/chat" element={<ChatSection />} />
    </Routes>
    </StoreProvider>
    </BrowserRouter>
    </>
  )
}

export default App
