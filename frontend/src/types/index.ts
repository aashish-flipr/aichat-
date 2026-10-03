export interface Message {
  id: string;
  role: 'human' | 'ai';
  content: string;
}
