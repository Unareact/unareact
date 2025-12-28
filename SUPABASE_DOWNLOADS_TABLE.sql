-- Tabela para armazenar downloads de vídeos
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS video_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', etc
  title TEXT,
  filename TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_path TEXT, -- Caminho local (temporário)
  storage_url TEXT, -- URL do arquivo no Supabase Storage
  format TEXT DEFAULT 'mp4',
  quality TEXT DEFAULT 'best',
  duration INTEGER, -- Duração em segundos
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_video_downloads_user_id ON video_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_video_downloads_video_id ON video_downloads(video_id);
CREATE INDEX IF NOT EXISTS idx_video_downloads_platform ON video_downloads(platform);
CREATE INDEX IF NOT EXISTS idx_video_downloads_downloaded_at ON video_downloads(downloaded_at DESC);

-- Row Level Security (RLS)
ALTER TABLE video_downloads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios downloads
CREATE POLICY "Users can view own downloads" ON video_downloads
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Política: Usuários podem criar downloads
CREATE POLICY "Users can create downloads" ON video_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Política: Usuários podem deletar seus próprios downloads
CREATE POLICY "Users can delete own downloads" ON video_downloads
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_video_downloads_updated_at
  BEFORE UPDATE ON video_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

