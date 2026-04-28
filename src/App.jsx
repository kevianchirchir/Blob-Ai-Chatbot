import './App.css'
import { Blob, Widget, Search, Cog, CaretBigRight, Stop, Menu, Trash } from '@boxicons/react'
import { useState, useRef, useEffect } from 'react'
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
    <div className="w-full min-h-screen h-dvh flex flex-col bg-white  overflow-hidden">   <Sidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      chats={chats}
      setChats={setChats}
      activeChatId={activeChatId}
      setActiveChatId={setActiveChatId}
    />

      <Chatbot
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        setChats={setChats}
        activeChatId={activeChatId}
      />
    </div>
  )
}


function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  chats,
  setChats,
  activeChatId,
  setActiveChatId
}) {

  const openChat = (id) => {
    setActiveChatId(id)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* overlay (mobile) */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden ${sidebarOpen ? "block" : "hidden"
          }`}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >

        {/* HEADER */}
        <div className="flex flex-col items-center gap-2 pt-6 pb-4 relative">

          <button
            className="md:hidden absolute left-3 top-3"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <Blob size={28} />
            <h1 className="font-bold text-2xl">Blob AI</h1>
          </div>

          <div className="w-32 h-1 bg-blue-400 rounded-full shadow-md"></div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="px-4 flex flex-col gap-2">

          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
            onClick={() => {
              const newChat = {
                id: Date.now(),
                title: "New Chat",
                messages: []
              }

              setChats(prev => [newChat, ...prev])
              setActiveChatId(newChat.id)
              setSidebarOpen(false)
            }}
          >
            <Widget size={20} /> New Chat
          </button>



        </div>

        {/* CHAT LIST  */}
        <div className="mt-4 px-4 flex-1 overflow-y-auto flex flex-col gap-2">

          {chats.map(chat => (
            <div
              key={chat.id}
              className={`group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-blue-100 transition ${chat.id === activeChatId ? "bg-blue-100" : ""
                }`}
            >

              {/* CHAT TITLE */}
              <button
                onClick={() => openChat(chat.id)}
                className="text-left text-sm flex-1 px-2 py-1 truncate"
              >
                {chat.title}
              </button>

              {/* DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation()

                  setChats(prev => {
                    const updated = prev.filter(c => c.id !== chat.id)

                    // switch if active chat deleted
                    if (chat.id === activeChatId && updated.length > 0) {
                      setActiveChatId(updated[0].id)
                    }

                    return updated
                  })
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition"
              >
                <Trash size={16} />
              </button>

            </div>
          ))}

        </div>

        {/* FOOTER */}
        <div className="p-4 text-xs text-gray-400 text-center">
          Powered by Puter AI
        </div>

      </div>
    </>
  )
}

function Chatbot({
  setSidebarOpen,
  chats,
  setChats,
  activeChatId
}) {

  const activeChat = chats.find(c => c.id === activeChatId)

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages])

  const updateChat = (newMessages) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: newMessages }
          : chat
      )
    )
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = input
    setInput("")

    const isFirstMessage = activeChat.messages.length === 0

    const newMessages = [
      ...activeChat.messages,
      { role: "user", content: userMsg }
    ]

    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? {
            ...chat,
            title: isFirstMessage
              ? generateChatTitle(userMsg)
              : chat.title,
            messages: newMessages
          }
          : chat
      )
    )

    setLoading(true)
    abortRef.current = new AbortController()

    try {
      const res = await window.puter.ai.chat(newMessages, {
        signal: abortRef.current.signal
      })

      updateChat([
        ...newMessages,
        { role: "assistant", content: res.message.content }
      ])

    } catch (e) {
      console.log(e)
    }

    setLoading(false)
  }

  const stopGenerating = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">

      {/* HEADER */}
      <div className="p-3 md:p-4 flex items-center gap-2">

        <button
          className="md:hidden text-2xl"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="font-semibold">Blob AI</h1>
          <p className="text-xs text-gray-500">Chat</p>
        </div>

      </div>

      {/* MESSAGES WRAPPER */}
      <div className="flex-1 relative overflow-hidden">

        {/* SCROLL AREA */}
        <div className="h-full overflow-y-auto px-4 pb-32 flex flex-col gap-3">

          {activeChat?.messages?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              What do you want to talk about?
            </div>
          ) : (
            activeChat?.messages?.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user"
                  ? "self-end flex-row-reverse"
                  : "self-start"
                  }`}
              >

                {/* AI AVATAR */}
                {msg.role === "assistant" && (
                  <Blob className="w-7 h-7 mt-1" />
                )}

                <div>

                  {/* AI NAME */}
                  {msg.role === "assistant" && (
                    <p className="text-xs text-gray-500 mb-1">
                      Blob AI
                    </p>
                  )}

                  {/* MESSAGE BUBBLE */}
                  <div
                    className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap leading-relaxed break-words ${msg.role === "user"
                      ? "bg-blue-400 text-white"
                      : "bg-gray-200"
                      }`}
                  >
                    {msg.content}
                  </div>

                </div>

              </div>
            ))
          )}

          {/* SCROLL ANCHOR */}
          <div ref={messagesEndRef} />

          {/* THINKING */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm px-2">
              <Blob className="w-5 h-5 animate-spin" />
              Blob AI is thinking...
            </div>
          )}

        </div>

        {/* text blurr */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent" />

      </div>

      {/* INPUT AREA */}
      <div className="relative z-10 p-3 flex justify-center">

        <div className="w-full max-w-2xl flex items-center bg-gray-200 rounded-full px-2">

          <textarea
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask anything 😊"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none px-3 py-2 text-sm leading-relaxed placeholder:text-gray-400"
          />

          <button
            onClick={loading ? stopGenerating : sendMessage}
            className={`p-2 rounded-full text-white ${loading ? "bg-red-500" : "bg-blue-400"
              }`}
          >
            {loading ? <Stop size={16} /> : <CaretBigRight size={16} />}
          </button>

        </div>

      </div>

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