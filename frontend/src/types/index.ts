export interface Message {
  id: string;
  role: 'human' | 'ai';
  content: string;
}

export interface SessionInfo {
  id: string;
  name: string;
}
