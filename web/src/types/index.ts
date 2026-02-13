export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface Session {
  id: string;
  imageUrl: string;
  startTime: Date;
  endTime?: Date;
  messages: ConversationMessage[];
  status: 'active' | 'completed' | 'expired';
}

export interface ImageAnalysisResponse {
  description: string;
  conversationStarter: string;
  suggestedTopics: string[];
}

export interface VoiceInput {
  audioBlob: Blob;
  transcription: string;
  duration: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConversationState {
  session: Session | null;
  isRecording: boolean;
  isProcessing: boolean;
  timeRemaining: number;
  selectedImage: string | null;
}
