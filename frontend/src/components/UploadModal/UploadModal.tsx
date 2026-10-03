import React, { useState } from 'react';
import styles from './UploadModal.module.scss';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const formData = new FormData();
    if (activeTab === 'text' && text) {
      formData.append('text', text);
    } else if (activeTab === 'file' && file) {
      formData.append('file', file);
    } else {
      setStatus({ type: 'error', message: 'Please provide either text or a file.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/send`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload data');

      setStatus({ type: 'success', message: 'Knowledge successfully ingested into the AI!' });
      setText('');
      setFile(null);
      
      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 2500);

    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong during ingestion.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.modalOverlay} animate-fade-in`}>
      <div className={`${styles.modalContent} glass-panel`}>
        <div className={styles.modalHeader}>
          <h2>Provide AI Knowledge</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'text' ? styles.active : ''}`}
            onClick={() => setActiveTab('text')}
          >
            Raw Text
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'file' ? styles.active : ''}`}
            onClick={() => setActiveTab('file')}
          >
            Upload File
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.uploadForm}>
          {activeTab === 'text' ? (
            <div className={styles.formGroup}>
              <label>Paste text content here:</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="E.g., I am a software engineer from Bhopal..."
                rows={6}
              />
            </div>
          ) : (
            <div className={`${styles.formGroup} ${styles.fileUploadArea}`}>
              <input 
                type="file" 
                id="file-upload" 
                accept=".txt,.md,.json,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              <label htmlFor="file-upload" className={styles.fileLabel}>
                <div className={styles.icon}>📄</div>
                <span>{file ? file.name : 'Click to select a file (.txt)'}</span>
              </label>
            </div>
          )}

          {status && (
            <div className={`${styles.statusMessage} ${styles[status.type]}`}>
              {status.message}
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={isLoading || (activeTab === 'text' && !text) || (activeTab === 'file' && !file)}>
              {isLoading ? 'Ingesting...' : 'Ingest to Chroma DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
