import React, { useState, useEffect, useCallback } from 'react';
import { ImageDisplay } from '@/components/ImageDisplay';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChatUI } from '@/components/ChatUI';
import { AIService } from '@/utils/ai';
import { v4 as uuidv4 } from 'uuid';
import { Session, ConversationMessage, ConversationState, ImageAnalysisResponse } from '@/types';

export default function Home() {
  const [conversationState, setConversationState] = useState<ConversationState>({
    session: null,
    isRecording: false,
    isProcessing: false,
    timeRemaining: 60,
    selectedImage: null,
  });

  const [isTyping, setIsTyping] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (conversationState.session?.status === 'active' && conversationState.timeRemaining > 0) {
      interval = setInterval(() => {
        setConversationState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            // End session when time is up
            return {
              ...prev,
              timeRemaining: 0,
              session: prev.session ? { ...prev.session, status: 'completed' } : null,
            };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [conversationState.session?.status, conversationState.timeRemaining]);

  const handleImageAnalyzed = useCallback(async (analysis: ImageAnalysisResponse, imageUrl: string) => {
    try {
      const sessionId = uuidv4();
      
      // Start session
      await AIService.startConversation(sessionId, imageUrl);
      
      const newSession: Session = {
        id: sessionId,
        imageUrl,
        startTime: new Date(),
        messages: [],
        status: 'active',
      };

      // Add AI's initial message
      const initialMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: analysis.conversationStarter,
        timestamp: new Date(),
      };

      newSession.messages.push(initialMessage);

      setConversationState(prev => ({
        ...prev,
        session: newSession,
        selectedImage: imageUrl,
        timeRemaining: 60,
      }));

      // Convert initial message to speech
      speakText(analysis.conversationStarter);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  }, []);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob, transcription: string) => {
    if (!conversationState.session || conversationState.session.status !== 'active') {
      return;
    }

    try {
      setConversationState(prev => ({ ...prev, isProcessing: true }));

      // Add user message
      const userMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'user',
        content: transcription,
        timestamp: new Date(),
      };

      const updatedSession = {
        ...conversationState.session,
        messages: [...conversationState.session.messages, userMessage],
      };

      setConversationState(prev => ({
        ...prev,
        session: updatedSession,
      }));

      setIsTyping(true);

      // Get AI response
      const response = await AIService.sendVoiceInput(
        conversationState.session.id,
        audioBlob,
        transcription
      );

      // Add AI response
      const aiMessage: ConversationMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        audioUrl: response.audioUrl,
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage],
      };

      setConversationState(prev => ({
        ...prev,
        session: finalSession,
        isProcessing: false,
      }));

      setIsTyping(false);

      // Play AI response audio if available
      if (response.audioUrl) {
        const audio = new Audio(response.audioUrl);
        audio.play().catch(error => {
          console.error('Error playing AI audio:', error);
        });
      } else {
        // Fallback to text-to-speech
        speakText(response.message);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Failed to process your voice input. Please try again.');
      setConversationState(prev => ({ ...prev, isProcessing: false }));
      setIsTyping(false);
    }
  }, [conversationState.session]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const resetConversation = () => {
    setConversationState({
      session: null,
      isRecording: false,
      isProcessing: false,
      timeRemaining: 60,
      selectedImage: null,
    });
    setIsTyping(false);
  };

  const isLoading = conversationState.isProcessing || conversationState.isRecording;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Child Conversation App
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image and have a 1-minute voice conversation with AI!
          </p>
        </header>

        <div className="space-y-8">
          {/* Image Upload Section */}
          {!conversationState.session && (
            <ImageDisplay
              onImageAnalyzed={handleImageAnalyzed}
              isLoading={isLoading}
            />
          )}

          {/* Active Session */}
          {conversationState.session && (
            <>
              {/* Session Info */}
              <div className="card w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Conversation Active
                    </h3>
                    <p className="text-sm text-gray-600">
                      Session ID: {conversationState.session.id.slice(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={resetConversation}
                    className="btn-secondary"
                  >
                    End Session
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div className="card w-full max-w-md mx-auto">
                <img
                  src={conversationState.selectedImage!}
                  alt="Conversation image"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Voice Recorder */}
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                isRecording={conversationState.isRecording}
                isProcessing={conversationState.isProcessing}
                timeRemaining={conversationState.timeRemaining}
                disabled={conversationState.session.status !== 'active'}
              />

              {/* Chat UI */}
              <ChatUI
                messages={conversationState.session.messages}
                isTyping={isTyping}
              />

              {/* Session Completed */}
              {conversationState.session.status === 'completed' && (
                <div className="card w-full max-w-2xl mx-auto text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Time's Up! 🎉
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You had a great conversation! You talked about the image for 
                    {conversationState.session.messages.length > 0 && ' '}
                    {Math.floor(conversationState.session.messages.length / 2)} rounds.
                  </p>
                  <button onClick={resetConversation} className="btn-primary">
                    Start New Conversation
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
