import {  useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from "../hooks/useChat";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


function ChatApp() {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSend,
    inputValuetoShow,
    setInputValuetoShhow,
    setAutoSend,
    basicSettingsData,
    setContext,
  } = useChat();

  const messagesEndRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { paramId } = useParams();

  useEffect(() => {
    if (paramId) localStorage.setItem("paramId", paramId);
  }, [paramId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      {!isModalOpen && (
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed bottom-8 right-8 bg-[#6a33a3] text-white p-4 rounded-full shadow-lg hover:bg-[#6a33a3] transition-all z-50`}
        >
          <div className="text-2xl flex gap-1"> <img className="w-5 h-5 border rounded-xl" src={basicSettingsData?.logo_url} alt="greeting"  /><h1 className="text-white font-bold text-xs">{basicSettingsData?.title}</h1></div>
        </motion.button>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="chat-modal"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed bottom-12 right-8 z-50"
          >
            <div
              className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
              style={{ height: "650px" }}
            >
              <ChatHeader setIsModalOpen={setIsModalOpen} basicSettingsData={basicSettingsData} />
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 chat-messages">
                <div className="text-center mb-4">
                  <span className="inline-block bg-white px-4 py-1 rounded-full text-sm text-gray-600 shadow-sm">
                    Today
                  </span>
                </div>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      setAutoSend={setAutoSend}
                      setInputValuetoShhow={setInputValuetoShhow}
                      setInputValue={setInputValue}
                      basicSettingsData={basicSettingsData}
                      setContext={setContext}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                inputValuetoShow={inputValuetoShow}
                setInputValuetoShhow={setInputValuetoShhow}
                basicSettingsData={basicSettingsData}
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatApp;

