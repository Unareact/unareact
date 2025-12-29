import { ScriptSegment } from '@/app/types';
import { generateImagesForSegments, GeneratedImage } from './ai-image-generation';

/**
 * Analisa o roteiro e identifica quais segmentos precisam de imagens geradas
 */
export function identifySegmentsNeedingImages(
  segments: ScriptSegment[]
): ScriptSegment[] {
  // Filtrar segmentos que não têm mídia associada ou que são de conteúdo
  return segments.filter((segment) => {
    // Segmentos de conteúdo geralmente precisam de imagens
    return segment.type === 'content' || segment.type === 'intro';
  });
}

/**
 * Gera imagens automaticamente para todos os segmentos que precisam
 */
export async function autoGenerateImagesForScript(
  segments: ScriptSegment[]
): Promise<GeneratedImage[]> {
  const segmentsNeedingImages = identifySegmentsNeedingImages(segments);
  
  if (segmentsNeedingImages.length === 0) {
    return [];
  }

  // Gerar imagens em lote (com limite para não sobrecarregar)
  const batchSize = 3; // Processar 3 por vez
  const allGenerated: GeneratedImage[] = [];

  for (let i = 0; i < segmentsNeedingImages.length; i += batchSize) {
    const batch = segmentsNeedingImages.slice(i, i + batchSize);
    const batchResults = await generateImagesForSegments(batch);
    allGenerated.push(...batchResults);
    
    // Pequeno delay entre batches para não sobrecarregar a API
    if (i + batchSize < segmentsNeedingImages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return allGenerated;
}

