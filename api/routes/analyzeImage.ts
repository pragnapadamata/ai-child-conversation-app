import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeImageWithAI } from '../config/openai';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');

    // Analyze image with AI
    const analysis = await analyzeImageWithAI(imageBase64);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
    });
  }
});

export { router as analyzeImageRoutes };
