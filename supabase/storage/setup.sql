-- Create storage buckets for images and audio

-- Create bucket for conversation images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conversation-images',
  'conversation-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for conversation audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conversation-audio',
  'conversation-audio',
  true,
  5242880, -- 5MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for storage buckets

-- Policies for conversation-images bucket
CREATE POLICY "Anyone can view conversation images" ON storage.objects
  FOR SELECT USING (bucket_id = 'conversation-images');

CREATE POLICY "Anyone can upload conversation images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'conversation-images');

CREATE POLICY "Anyone can update conversation images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'conversation-images');

CREATE POLICY "Anyone can delete conversation images" ON storage.objects
  FOR DELETE USING (bucket_id = 'conversation-images');

-- Policies for conversation-audio bucket
CREATE POLICY "Anyone can view conversation audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'conversation-audio');

CREATE POLICY "Anyone can upload conversation audio" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'conversation-audio');

CREATE POLICY "Anyone can update conversation audio" ON storage.objects
  FOR UPDATE USING (bucket_id = 'conversation-audio');

CREATE POLICY "Anyone can delete conversation audio" ON storage.objects
  FOR DELETE USING (bucket_id = 'conversation-audio');
