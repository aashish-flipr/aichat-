import React from "react";
import type { Message } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./ChatArea.module.scss";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSendMessage,
  messagesEndRef,
}) => {
  return (
    <main className={styles.chatArea}>
      <header className={`${styles.chatHeader} glass-panel`}>
        <h3>
          QueryChat AI <span className={styles.badge}>Beta</span>
        </h3>
      </header>

      <div className={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`${styles.messageWrapper} ${styles[msg.role]} animate-fade-in`}
            style={{ animationDelay: `${Math.min(idx * 0.1, 0.5)}s` }}
          >
            <div className={styles.messageContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.ai}`}>
            <div
              className={`${styles.messageContent} ${styles.typingIndicator}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <form
          className={`${styles.inputForm} glass-panel`}
          onSubmit={onSendMessage}
        >
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Message QueryChat..."
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={inputValue.trim() ? styles.active : ""}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
};
