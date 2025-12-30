import { NextResponse } from 'next/server';
import { TikTokService } from '@/app/lib/services/tiktok-service';

export async function GET() {
  const tiktokService = new TikTokService();
  const results: any = {
    apiKey: {
      exists: !!process.env.TIKTOK_RAPIDAPI_KEY,
      length: process.env.TIKTOK_RAPIDAPI_KEY?.length || 0,
      prefix: process.env.TIKTOK_RAPIDAPI_KEY?.substring(0, 10) + '...' || 'NOT SET',
    },
    apiHost: {
      exists: !!process.env.TIKTOK_RAPIDAPI_HOST,
      value: process.env.TIKTOK_RAPIDAPI_HOST || 'NOT SET',
    },
    testResults: [] as any[],
  };

  // Testar cada endpoint
  const endpoints = [
    `/api/post/trending?count=5`,
    `/api/video/trending?count=5`,
    `/api/feed/trending?count=5`,
    `/api/post/feed?count=5`,
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `https://${process.env.TIKTOK_RAPIDAPI_HOST}${endpoint}`;
      
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'x-rapidapi-host': process.env.TIKTOK_RAPIDAPI_HOST!,
          'x-rapidapi-key': process.env.TIKTOK_RAPIDAPI_KEY!,
        },
      });

      const responseTime = Date.now() - startTime;
      const status = response.status;
      const statusText = response.statusText;
      
      let responseData: any = null;
      let errorMessage: string | null = null;
      
      try {
        responseData = await response.json();
      } catch (e: any) {
        errorMessage = `Failed to parse JSON: ${e.message}`;
        const text = await response.text();
        responseData = { rawText: text.substring(0, 500) };
      }

      results.testResults.push({
        endpoint,
        url,
        status,
        statusText,
        ok: response.ok,
        responseTime: `${responseTime}ms`,
        hasData: !!responseData,
        dataKeys: responseData ? Object.keys(responseData) : [],
        hasDataObject: !!responseData?.data,
        dataObjectKeys: responseData?.data ? Object.keys(responseData.data) : [],
        hasMusicList: !!responseData?.data?.music_list,
        hasItemList: !!responseData?.itemList || !!responseData?.data?.item_list,
        hasVideos: !!responseData?.data?.videos,
        itemListCount: responseData?.itemList?.length || responseData?.data?.item_list?.length || 0,
        musicListCount: responseData?.data?.music_list?.length || 0,
        errorMessage,
        sampleData: responseData ? JSON.stringify(responseData).substring(0, 1000) : null,
      });

      // Se funcionou, tentar normalizar
      if (response.ok && !responseData?.data?.music_list) {
        try {
          const normalized = await tiktokService.getTrending(5);
          results.testResults[results.testResults.length - 1].normalizedCount = normalized.length;
          results.testResults[results.testResults.length - 1].normalizedSample = normalized.length > 0 ? {
            id: normalized[0].id,
            title: normalized[0].title?.substring(0, 50),
            platform: normalized[0].platform,
          } : null;
        } catch (normalizeError: any) {
          results.testResults[results.testResults.length - 1].normalizeError = normalizeError.message;
        }
      }
    } catch (error: any) {
      results.testResults.push({
        endpoint,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  return NextResponse.json(results, { status: 200 });
}

