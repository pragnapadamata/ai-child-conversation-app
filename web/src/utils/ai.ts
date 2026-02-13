import { ImageAnalysisResponse, APIResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class AIService {
  static async analyzeImage(imageFile: File): Promise<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/analyzeImage`, {
      method: 'POST',
      body: formData,
    });

    const result: APIResponse<ImageAnalysisResponse> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze image');
    }

    return result.data;
  }

  static async startConversation(sessionId: string, imageUrl: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/startConversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, imageUrl }),
    });

    const result: APIResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to start conversation');
    }
  }

  static async sendVoiceInput(
    sessionId: string, 
    audioBlob: Blob, 
    transcription: string
  ): Promise<{ message: string; audioUrl?: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('transcription', transcription);
    formData.append('sessionId', sessionId);

    const response = await fetch(`${API_BASE_URL}/api/sendVoiceInput`, {
      method: 'POST',
      body: formData,
    });

    const result: APIResponse<{ message: string; audioUrl?: string }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to process voice input');
    }

    return result.data;
  }

  static async uploadImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/uploadImage`, {
      method: 'POST',
      body: formData,
    });

    const result: APIResponse<{ imageUrl: string }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to upload image');
    }

    return result.data.imageUrl;
  }
}
