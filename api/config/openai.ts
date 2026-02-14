import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export { openai };

export const analyzeImageWithAI = async (imageBase64: string): Promise<{
  description: string;
  conversationStarter: string;
  suggestedTopics: string[];
}> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system' as const,
          content: 'You are a friendly AI assistant for children. Analyze the image and provide a child-friendly description and conversation starter. Respond in JSON format with: description (simple, engaging), conversationStarter (question to start conversation), suggestedTopics (array of 3-5 topics to discuss).',
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: 'Analyze this image for a conversation with a child:',
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze image with AI');
  }
};

export const generateConversationResponse = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  imageDescription?: string
): Promise<string> => {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a friendly AI assistant having a conversation with a child about an image. 
        ${imageDescription ? `The image shows: ${imageDescription}` : ''}
        Keep responses:
        - Child-friendly and age-appropriate
        - Engaging and encouraging
        - 1-2 sentences long
        - Ask follow-up questions to keep the conversation going
        Be warm, enthusiastic, and educational.`,
      },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "I'm excited to talk more about this! What else do you notice?";
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate conversation response');
  }
};

export const textToSpeech = async (text: string): Promise<Buffer> => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      speed: 0.9,
    });

    return Buffer.from(await mp3.arrayBuffer());
  } catch (error) {
    console.error('OpenAI TTS error:', error);
    throw new Error('Failed to convert text to speech');
  }
};
