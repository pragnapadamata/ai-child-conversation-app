import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { AIService } from '@/utils/ai';
import { ImageAnalysisResponse } from '@/types';

interface ImageDisplayProps {
  onImageAnalyzed: (analysis: ImageAnalysisResponse, imageUrl: string) => void;
  isLoading: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ onImageAnalyzed, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setIsAnalyzing(true);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      const [analysis, uploadedUrl] = await Promise.all([
        AIService.analyzeImage(file),
        AIService.uploadImage(file)
      ]);

      onImageAnalyzed(analysis, uploadedUrl);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
      setSelectedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onImageAnalyzed]);

  return (
    <div className="card w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Upload an Image to Start Conversation
      </h2>
      
      <div className="relative">
        {selectedImage ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-64 object-cover"
              />
              {(isAnalyzing || isLoading) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Analyzing image...</p>
                  </div>
                </div>
              )}
            </div>
            
            <label className="btn-secondary inline-block cursor-pointer text-center w-full">
              <Upload className="inline-block w-4 h-4 mr-2" />
              Choose Different Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isAnalyzing || isLoading}
              />
            </label>
          </div>
        ) : (
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition-colors duration-200">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Click to upload an image</p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isAnalyzing || isLoading}
            />
          </label>
        )}
      </div>
    </div>
  );
};
