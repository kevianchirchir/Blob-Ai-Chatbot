import { useState } from "react"
import { Menu, Widget, Trash, Blob } from "@boxicons/react"
import { motion, AnimatePresence } from "motion/react"

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
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 flex flex-col transition-transform duration-300 border-r border-white/10
          bg-zinc-900
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >

        {/* Header */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-5 px-4 border-b border-white/10 relative">
          <button
            className="md:hidden absolute left-4 top-5 text-white/40 hover:text-white transition"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Blob size={18} className="text-blue-400" />
            </div>
            <h1 className="font-bold text-lg text-white tracking-tight">Blob AI</h1>
          </div>

          <div className="w-8 h-0.5 bg-blue-500/50 rounded-full" />
        </div>

        {/* New chat button */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => {
              const newChat = { id: Date.now(), title: "New Chat", messages: [] }
              setChats(prev => [newChat, ...prev])
              setActiveChatId(newChat.id)
              setSidebarOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
          >
            <Widget size={16} className="text-blue-400" />
            New Chat
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 py-2">
          {chats.length === 0 && (
            <p className="text-xs text-white/20 text-center mt-6">No chats yet</p>
          )}

          <AnimatePresence>
            {chats.map(chat => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer
                  ${chat.id === activeChatId
                    ? "bg-blue-500/15 border border-blue-500/30 text-white"
                    : "hover:bg-white/5 border border-transparent text-white/50 hover:text-white"
                  }`}
              >
                <button
                  onClick={() => openChat(chat.id)}
                  className="text-left text-sm flex-1 truncate"
                >
                  {chat.title}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setChats(prev => {
                      const updated = prev.filter(c => c.id !== chat.id)
                      if (chat.id === activeChatId && updated.length > 0) {
                        setActiveChatId(updated[0].id)
                      }
                      return updated
                    })
                  }}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all ml-1 flex-shrink-0"
                >
                  <Trash size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
          <p className="text-xs text-white/25 tracking-wide">Powered by Puter AI</p>
        </div>

      </div>
    </>
  )
}

export default Sidebar