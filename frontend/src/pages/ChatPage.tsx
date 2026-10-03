import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ChatArea } from "../components/ChatArea/ChatArea";
import { UploadModal } from "../components/UploadModal/UploadModal";
import type { Message } from "../types";
import styles from "./ChatPage.module.scss";

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I am your intelligent assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(`session-${Math.random().toString(36).substr(2, 9)}`);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sessions, setSessions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch all sessions on load
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions`);
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && messages.length === 1 && messages[0].id === "1") {
          // If we have history but haven't started chatting, load the latest session
          setSessionId(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      }
    };
    fetchSessions();
  }, []);

  // Fetch history when sessionId changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/history/${sessionId}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const loadedMessages = data.map((msg: any) => ({
            id: msg._id,
            role: msg.role,
            content: msg.content
          }));
          setMessages(loadedMessages);
        } else {
          setMessages([
            {
              id: "1",
              role: "ai",
              content: "Hello! I am your intelligent assistant. How can I help you today?",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const handleNewChat = () => {
    setSessionId(`session-${Math.random().toString(36).substr(2, 9)}`);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "human",
      content: inputValue.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (!sessions.includes(sessionId)) {
        setSessions((prev) => [sessionId, ...prev]);
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMsg.content }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.response || data.message || "Error getting response",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I encountered an error connecting to the server.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar
        sessions={sessions}
        currentSession={sessionId}
        onSelectSession={setSessionId}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onNewChat={handleNewChat}
      />

      <ChatArea
        messages={messages}
        isLoading={isLoading}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
