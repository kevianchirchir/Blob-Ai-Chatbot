import './App.css'
import { Blob, Widget, Search, Cog, CaretBigRight, Stop, Menu, Trash, Sidebar } from '@boxicons/react'
import { useState, useRef, useEffect } from 'react'
import SidebarComp from "./components/Sidebar.jsx"
import ChatbotComp from "./components/Chatbot.jsx"
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)


  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("blob_chats")
    return saved
      ? JSON.parse(saved)
      : [{ id: 1, title: "New Chat", messages: [] }]
  })

  const [activeChatId, setActiveChatId] = useState(1)
  useEffect(() => {
    localStorage.setItem("blob_chats", JSON.stringify(chats))
  }, [chats])

  return (
    <div className="flex min-h-screen h-[100dvh] overflow-x-hidden">
      <SidebarComp
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        setChats={setChats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />

      <ChatbotComp
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        setChats={setChats}
        activeChatId={activeChatId}
      />
    </div>
  )
}





{/*lil generation */ }
function generateChatTitle(text) {
  return text
    .trim()
    .split(" ")
    .slice(0, 6)
    .join(" ")
}
export default App