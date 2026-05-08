import { useState, useRef, useEffect } from "react"
import { Menu, CaretBigRight, Blob, Stop } from "@boxicons/react"
import { motion, AnimatePresence } from "motion/react"

function generateChatTitle(msg) {
    return msg.length > 30 ? msg.slice(0, 30) + "..." : msg
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [activeChat?.messages])

    // fix: on mobile the keyboard pushes the viewport up and breaks fixed layouts
    useEffect(() => {
        const handleResize = () => {
            document.documentElement.style.setProperty(
                "--vh", `${window.innerHeight * 0.01}px`
            )
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

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
                        title: isFirstMessage ? generateChatTitle(userMsg) : chat.title,
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
            const aiRaw = res.message.content
            let aiText = ""
            if (Array.isArray(aiRaw)) {
                aiText = aiRaw.map(item => item.text).join("")
            } else if (typeof aiRaw === "object") {
                aiText = aiRaw.text || ""
            } else {
                aiText = aiRaw
            }
            updateChat([...newMessages, { role: "assistant", content: aiText }])
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
        <div
            className="w-full flex flex-col bg-zinc-900"
            style={{ height: "calc(var(--vh, 1vh) * 100)" }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
                <button
                    className="md:hidden text-white/40 hover:text-white transition p-1"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu size={20} />
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                        <Blob size={14} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-none">Blob AI</p>
                        <p className="text-xs text-white/30 leading-none mt-0.5">
                            {loading
                                ? <span className="text-blue-400">thinking...</span>
                                : "ready"
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 relative overflow-hidden min-h-0">
                <div className="h-full overflow-y-auto px-3 sm:px-4 py-4 pb-4 flex flex-col gap-3">

                    {activeChat?.messages?.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full gap-3 text-center px-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                                <Blob size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white/60 font-medium text-sm">What's on your mind?</p>
                                <p className="text-white/25 text-xs mt-1">Ask me anything</p>
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {activeChat?.messages?.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-end gap-2 w-full ${msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mb-0.5">
                                            <Blob size={12} className="text-blue-400" />
                                        </div>
                                    )}

                                    <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                        {msg.role === "assistant" && (
                                            <p className="text-xs text-white/30 px-1">Blob AI</p>
                                        )}
                                        <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed break-words
                                            ${msg.role === "user"
                                                ? "bg-blue-500 text-white rounded-br-sm"
                                                : "bg-white/8 text-white/85 border border-white/10 rounded-bl-sm"
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Thinking indicator */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                                    <Blob size={12} className="text-blue-400" />
                                </div>
                                <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
                                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-900 to-transparent" />
            </div>

            {/* Input */}
            <div className="px-3 sm:px-4 pb-4 pt-2 flex-shrink-0">
                <div className="w-full max-w-2xl mx-auto flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 sm:px-4 py-2 focus-within:border-blue-500/50 transition-colors">
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
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 resize-none bg-transparent outline-none py-1 text-sm text-white placeholder:text-white/25 leading-relaxed"
                    />
                    <button
                        onClick={loading ? stopGenerating : sendMessage}
                        className={`p-2 rounded-xl text-white transition-all flex-shrink-0 mb-0.5
                            ${loading
                                ? "bg-red-500/80 hover:bg-red-500"
                                : "bg-blue-500 hover:bg-blue-400 active:scale-95"
                            }`}
                    >
                        {loading ? <Stop size={14} /> : <CaretBigRight size={14} />}
                    </button>
                </div>
                <p className="text-center text-xs text-white/15 mt-2">Powered by Puter AI</p>
            </div>
        </div>
    )
}

export default Chatbot