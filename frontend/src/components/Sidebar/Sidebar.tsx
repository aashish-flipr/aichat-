import React, { useState, useEffect, useCallback } from "react";
import styles from "./Sidebar.module.scss";
import type { SessionInfo } from "../../types";

interface SidebarProps {
  sessions: SessionInfo[];
  currentSession: string;
  onSelectSession: (id: string) => void;
  onOpenUpload: () => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onOpenUpload,
  onNewChat,
}) => {
  const [width, setWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        // Adjust these boundaries to limit min/max width of sidebar
        const newWidth = Math.min(600, Math.max(200, e.clientX));
        setWidth(newWidth);
      }
    },
    [isResizing],
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <aside className={styles.sidebar} style={{ width }}>
      <div className={styles.resizer} onMouseDown={startResizing} />
      <div className={styles.sidebarHeader}>
        <h2 className="gradient-text">QueryChat</h2>
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Chat
        </button>
      </div>
      <div className={styles.sidebarContent}>
        {sessions.length === 0 && (
          <div className={styles.historyItem}>No past chats</div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`${styles.historyItem} ${session.id === currentSession ? styles.active : ""}`}
            onClick={() => onSelectSession(session.id)}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {session.name}
          </div>
        ))}
      </div>
      <div className={styles.sidebarFooter}>
        <button className={styles.ingestBtn} onClick={onOpenUpload}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload Knowledge
        </button>
      </div>
    </aside>
  );
};
