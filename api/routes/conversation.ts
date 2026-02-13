import { Router, Request, Response } from 'express';
import multer from 'multer';
import { generateConversationResponse, textToSpeech } from '../config/openai';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for audio upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for audio
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Start conversation
router.post('/startConversation', async (req: Request, res: Response) => {
  try {
    const { sessionId, imageUrl } = req.body;

    if (!sessionId || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and image URL are required',
      });
    }

    // Create conversation in database
    const { error } = await supabase
      .from('conversations')
      .insert({
        id: sessionId,
        image_url: imageUrl,
        start_time: new Date().toISOString(),
        status: 'active',
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create conversation',
      });
    }

    res.json({
      success: true,
      data: { sessionId },
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation',
    });
  }
});

// Send voice input and get AI response
router.post('/sendVoiceInput', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { sessionId, transcription } = req.body;
    const audioFile = req.file;

    if (!sessionId || !transcription) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and transcription are required',
      });
    }

    // Get conversation history
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', sessionId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Database error:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch conversation history',
      });
    }

    // Get image description from conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('image_url')
      .eq('id', sessionId)
      .single();

    // Generate AI response
    const aiResponse = await generateConversationResponse(
      transcription,
      messages || [],
      conversation?.image_url
    );

    // Convert AI response to speech
    let audioUrl: string | undefined;
    try {
      const audioBuffer = await textToSpeech(aiResponse);
      
      // Upload audio to Supabase Storage
      const fileName = `audio/${sessionId}/${uuidv4()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('conversation-audio')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
        });

      if (uploadError) {
        console.error('Audio upload error:', uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('conversation-audio')
          .getPublicUrl(fileName);
        audioUrl = publicUrl;
      }
    } catch (ttsError) {
      console.error('TTS error:', ttsError);
      // Continue without audio
    }

    // Save user message
    const userMessageId = uuidv4();
    await supabase
      .from('messages')
      .insert({
        id: userMessageId,
        conversation_id: sessionId,
        role: 'user',
        content: transcription,
      });

    // Save AI response
    const aiMessageId = uuidv4();
    await supabase
      .from('messages')
      .insert({
        id: aiMessageId,
        conversation_id: sessionId,
        role: 'assistant',
        content: aiResponse,
        audio_url: audioUrl || null,
      });

    res.json({
      success: true,
      data: {
        message: aiResponse,
        audioUrl: audioUrl || undefined,
      },
    });
  } catch (error) {
    console.error('Error processing voice input:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice input',
    });
  }
});

export { router as conversationRoutes };
