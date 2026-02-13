import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error: ' + error.message,
    });
  }

  if (error.name === 'MulterError') {
    if (error.message.includes('File too large')) {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error: ' + error.message,
    });
  }

  if (error.message.includes('OpenAI')) {
    return res.status(502).json({
      success: false,
      error: 'AI service temporarily unavailable. Please try again.',
    });
  }

  if (error.message.includes('Supabase')) {
    return res.status(503).json({
      success: false,
      error: 'Database service temporarily unavailable. Please try again.',
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again later.',
  });
};
