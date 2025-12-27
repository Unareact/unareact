import { NextResponse } from 'next/server';

export async function GET() {
  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const tiktokKey = process.env.TIKTOK_RAPIDAPI_KEY;
  const tiktokHost = process.env.TIKTOK_RAPIDAPI_HOST;

  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasEnvLocal: 'check manually',
    },
    youtube: {
      hasKey: !!youtubeKey,
      keyLength: youtubeKey?.length || 0,
      keyPrefix: youtubeKey ? youtubeKey.substring(0, 10) + '...' : 'NOT SET',
    },
    tiktok: {
      hasKey: !!tiktokKey,
      hasHost: !!tiktokHost,
      keyLength: tiktokKey?.length || 0,
      keyPrefix: tiktokKey ? tiktokKey.substring(0, 10) + '...' : 'NOT SET',
      host: tiktokHost || 'NOT SET',
    },
    instructions: {
      youtube: youtubeKey 
        ? '✅ YouTube API Key está configurada' 
        : '❌ Configure YOUTUBE_API_KEY no .env.local',
      tiktok: (tiktokKey && tiktokHost)
        ? '✅ TikTok API está configurada'
        : '❌ Configure TIKTOK_RAPIDAPI_KEY e TIKTOK_RAPIDAPI_HOST no .env.local',
    },
  });
}

