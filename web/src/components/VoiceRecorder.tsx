import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Clock } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcription: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  timeRemaining: number;
  disabled: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isRecording,
  isProcessing,
  timeRemaining,
  disabled
}) => {
  const [isLocalRecording, setIsLocalRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Transcribe audio using Web Speech API
        const transcription = await transcribeAudio(audioBlob);
        
        onRecordingComplete(audioBlob, transcription);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsLocalRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check your permissions.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isLocalRecording) {
      mediaRecorderRef.current.stop();
      setIsLocalRecording(false);
    }
  }, [isLocalRecording]);

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recognition = new (window as any).webkitSpeechRecognition() || 
                         new (window as any).SpeechRecognition();
      
      if (!recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        if (!recognition.result) {
          resolve(''); // No speech detected
        }
      };

      // Create audio element and play it for recognition
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      recognition.start();
      audio.play();
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isButtonDisabled = disabled || isProcessing || timeRemaining <= 0;

  return (
    <div className="card w-full max-w-md mx-auto">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-4">
          <Clock className="w-6 h-6 text-gray-600" />
          <span className={`text-2xl font-mono font-bold ${
            timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-800'
          }`}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        <button
          onClick={isLocalRecording ? stopRecording : startRecording}
          disabled={isButtonDisabled}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
            isLocalRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : isButtonDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {isLocalRecording ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>

        <div className="text-sm text-gray-600">
          {isProcessing ? (
            <p className="text-primary-600 font-medium">Processing your voice...</p>
          ) : isLocalRecording ? (
            <p className="text-red-600 font-medium">Recording... Click to stop</p>
          ) : timeRemaining <= 0 ? (
            <p className="text-red-600 font-medium">Time's up!</p>
          ) : disabled ? (
            <p>Upload an image to start</p>
          ) : (
            <p>Click to start talking about the image</p>
          )}
        </div>

        {timeRemaining <= 30 && timeRemaining > 0 && !isLocalRecording && (
          <div className="text-amber-600 text-sm font-medium bg-amber-50 p-3 rounded-lg">
            ⏰ Only {timeRemaining} seconds remaining!
          </div>
        )}
      </div>
    </div>
  );
};
