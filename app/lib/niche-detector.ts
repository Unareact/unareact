/**
 * Detecta o nicho/tema do tópico e retorna configurações específicas
 */

export type Niche = 
  | 'education' 
  | 'entertainment' 
  | 'business' 
  | 'lifestyle' 
  | 'tech' 
  | 'health' 
  | 'finance' 
  | 'marketing' 
  | 'cooking' 
  | 'fitness' 
  | 'travel' 
  | 'general';

export interface NicheConfig {
  niche: Niche;
  name: string;
  preferredStructures: string[];
  keyTechniques: string[];
  languageStyle: string;
  hookExamples: string[];
  pacingGuidance: string;
  ctaStyle: string;
}

const NICHE_KEYWORDS: Record<Niche, string[]> = {
  education: ['aprender', 'curso', 'aula', 'ensinar', 'estudar', 'tutorial', 'como fazer', 'guia', 'dica', 'explicar', 'conceito', 'método'],
  entertainment: ['filme', 'série', 'música', 'jogo', 'celebridade', 'fofoca', 'reação', 'review', 'top 10', 'ranking', 'melhor', 'pior'],
  business: ['negócio', 'empresa', 'startup', 'empreendedor', 'vendas', 'lucro', 'mercado', 'investimento', 'estrategia', 'b2b', 'b2c', 'roi'],
  lifestyle: ['vida', 'rotina', 'organização', 'produtividade', 'minimalismo', 'desenvolvimento pessoal', 'transformação', 'hábito', 'mudança'],
  tech: ['tecnologia', 'app', 'software', 'programação', 'ia', 'inteligência artificial', 'código', 'desenvolvimento', 'startup tech', 'inovação'],
  health: ['saúde', 'exercício', 'dieta', 'nutrição', 'bem-estar', 'fitness', 'treino', 'alimentação', 'medicina', 'cuidado'],
  finance: ['dinheiro', 'investimento', 'economia', 'poupança', 'renda', 'finanças', 'bolsa', 'ações', 'cripto', 'orçamento'],
  marketing: ['marketing', 'vendas', 'publicidade', 'branding', 'social media', 'instagram', 'tiktok', 'youtube', 'influencer', 'conteúdo'],
  cooking: ['receita', 'comida', 'culinária', 'cozinha', 'prato', 'ingrediente', 'chef', 'gastronomia', 'restaurante', 'sabor'],
  fitness: ['treino', 'exercício', 'academia', 'musculação', 'corrida', 'yoga', 'pilates', 'crossfit', 'perder peso', 'ganhar massa'],
  travel: ['viagem', 'turismo', 'destino', 'hotel', 'passagem', 'lugares', 'país', 'cidade', 'passeio', 'aventura'],
  general: [],
};

export function detectNiche(topic: string): Niche {
  const topicLower = topic.toLowerCase();
  
  // Contar matches por nicho
  const scores: Record<Niche, number> = {
    education: 0,
    entertainment: 0,
    business: 0,
    lifestyle: 0,
    tech: 0,
    health: 0,
    finance: 0,
    marketing: 0,
    cooking: 0,
    fitness: 0,
    travel: 0,
    general: 0,
  };

  // Calcular scores
  for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (topicLower.includes(keyword)) {
        scores[niche as Niche]++;
      }
    }
  }

  // Encontrar nicho com maior score
  let maxScore = 0;
  let detectedNiche: Niche = 'general';
  
  for (const [niche, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedNiche = niche as Niche;
    }
  }

  return detectedNiche;
}

export function getNicheConfig(niche: Niche): NicheConfig {
  const configs: Record<Niche, NicheConfig> = {
    education: {
      niche: 'education',
      name: 'Educação',
      preferredStructures: ['Tutorial Passo-a-Passo', 'Problema-Solução', 'Conceito-Exemplo-Aplicação', 'Pergunta-Resposta Detalhada'],
      keyTechniques: [
        'Use exemplos concretos e práticos',
        'Divida em passos numerados ou etapas claras',
        'Inclua resumos e pontos-chave',
        'Use analogias para facilitar compreensão',
        'Termine com exercício ou aplicação prática'
      ],
      languageStyle: 'Clara, didática, acessível. Use linguagem simples mesmo para conceitos complexos. Evite jargões desnecessários.',
      hookExamples: [
        'Você já se perguntou por que [conceito] funciona assim?',
        'A maioria das pessoas não sabe que [insight]...',
        'Vou te ensinar [técnica] em [tempo] de forma simples'
      ],
      pacingGuidance: 'Ritmo médio a lento. Dê tempo para absorção. Pause entre conceitos importantes.',
      ctaStyle: 'Incentive prática: "Tente isso agora", "Aplique este conceito", "Pratique com este exercício"'
    },
    entertainment: {
      niche: 'entertainment',
      name: 'Entretenimento',
      preferredStructures: ['Storytelling 3-Act', 'Top N/Lista', 'Reação/Review', 'Comparação', 'Transformação'],
      keyTechniques: [
        'Use storytelling emocional',
        'Crie momentos de surpresa e revelação',
        'Inclua humor quando apropriado',
        'Use linguagem coloquial e descontraída',
        'Crie conexão emocional com o público'
      ],
      languageStyle: 'Descontraída, emocional, envolvente. Use expressões do dia a dia. Crie atmosfera.',
      hookExamples: [
        'Você não vai acreditar no que aconteceu...',
        'Isso mudou TUDO que eu pensava sobre...',
        'Prepare-se para ficar chocado com...'
      ],
      pacingGuidance: 'Ritmo rápido a médio. Mantenha energia alta. Muitas mudanças visuais/narrativas.',
      ctaStyle: 'Engajamento: "Compartilhe sua opinião", "Me conte nos comentários", "Assista a parte 2"'
    },
    business: {
      niche: 'business',
      name: 'Negócios',
      preferredStructures: ['Problema-Solução', 'Caso de Sucesso', 'Estratégia-Aplicação-Resultado', 'Dados-Insight-Ação'],
      keyTechniques: [
        'Use dados e estatísticas',
        'Apresente casos de sucesso reais',
        'Foque em ROI e resultados mensuráveis',
        'Estabeleça autoridade e credibilidade',
        'Use linguagem profissional mas acessível'
      ],
      languageStyle: 'Profissional, baseada em dados, orientada a resultados. Use números e métricas.',
      hookExamples: [
        'Empresas que usam [estratégia] aumentam receita em [%]...',
        'O erro que 90% dos negócios cometem é...',
        'Esta estratégia gerou [resultado] em [tempo]...'
      ],
      pacingGuidance: 'Ritmo médio. Dê tempo para processar informações importantes. Use pausas estratégicas.',
      ctaStyle: 'Ação profissional: "Implemente esta estratégia", "Baixe o guia completo", "Agende uma consultoria"'
    },
    lifestyle: {
      niche: 'lifestyle',
      name: 'Estilo de Vida',
      preferredStructures: ['Transformação Antes-Depois', 'Routine/Day in the Life', 'Desafio/Mudança', 'Dicas Práticas'],
      keyTechniques: [
        'Mostre transformação pessoal',
        'Use "antes e depois" quando aplicável',
        'Crie identificação com o público',
        'Seja autêntico e vulnerável',
        'Foque em bem-estar e qualidade de vida'
      ],
      languageStyle: 'Pessoal, autêntica, inspiradora. Use "eu", "você". Crie conexão emocional.',
      hookExamples: [
        'Há 6 meses eu estava [situação], hoje...',
        'Esta mudança simples transformou minha vida...',
        'Eu descobri que [insight] mudou tudo...'
      ],
      pacingGuidance: 'Ritmo médio. Permita momentos de reflexão. Crie atmosfera inspiradora.',
      ctaStyle: 'Engajamento pessoal: "Tente por 7 dias", "Me conte sua experiência", "Compartilhe sua transformação"'
    },
    tech: {
      niche: 'tech',
      name: 'Tecnologia',
      preferredStructures: ['Tutorial Técnico', 'Comparação de Tecnologias', 'Review/Análise', 'Futuro/Tendências'],
      keyTechniques: [
        'Balanceie técnico vs acessível (depende do público)',
        'Use exemplos práticos e casos de uso',
        'Compare opções quando relevante',
        'Explique benefícios além das features',
        'Use analogias para conceitos complexos'
      ],
      languageStyle: 'Precisa, técnica mas acessível. Adapte jargões ao nível do público-alvo.',
      hookExamples: [
        'Esta tecnologia vai mudar [área] para sempre...',
        'Você precisa conhecer [tecnologia] porque...',
        'A diferença entre [A] e [B] é crucial...'
      ],
      pacingGuidance: 'Ritmo médio. Dê tempo para processar informações técnicas. Use visualizações quando possível.',
      ctaStyle: 'Ação técnica: "Teste você mesmo", "Veja a documentação", "Experimente a demo"'
    },
    health: {
      niche: 'health',
      name: 'Saúde',
      preferredStructures: ['Problema-Solução', 'Mito vs Realidade', 'Guia Prático', 'Transformação'],
      keyTechniques: [
        'Baseie-se em evidências científicas',
        'Seja cuidadoso com alegações',
        'Use linguagem empoderadora',
        'Foque em bem-estar holístico',
        'Inclua avisos quando necessário'
      ],
      languageStyle: 'Cuidadosa, baseada em evidências, empoderadora. Evite alarmismo. Seja positivo mas realista.',
      hookExamples: [
        'O mito sobre [tema] que está te impedindo de...',
        'Ciência comprova que [insight]...',
        'Este hábito simples melhora [benefício] em [tempo]...'
      ],
      pacingGuidance: 'Ritmo médio. Dê tempo para absorver informações importantes. Crie atmosfera de cuidado.',
      ctaStyle: 'Ação saudável: "Experimente por [tempo]", "Consulte um profissional", "Comece hoje mesmo"'
    },
    finance: {
      niche: 'finance',
      name: 'Finanças',
      preferredStructures: ['Estratégia-Aplicação', 'Mito vs Realidade', 'Guia Prático', 'Comparação de Opções'],
      keyTechniques: [
        'Use números e cálculos concretos',
        'Apresente estratégias práticas',
        'Desmistifique conceitos financeiros',
        'Foque em resultados mensuráveis',
        'Seja transparente sobre riscos'
      ],
      languageStyle: 'Clara, baseada em dados, prática. Use exemplos numéricos. Evite jargões financeiros complexos.',
      hookExamples: [
        'Esta estratégia pode aumentar sua renda em [%]...',
        'O erro financeiro que custa [valor] por ano...',
        'Como transformar [X] em [Y] em [tempo]...'
      ],
      pacingGuidance: 'Ritmo médio. Dê tempo para processar números. Use pausas para cálculos importantes.',
      ctaStyle: 'Ação financeira: "Calcule seu potencial", "Comece com [valor]", "Baixe a planilha"'
    },
    marketing: {
      niche: 'marketing',
      name: 'Marketing',
      preferredStructures: ['Estratégia-Caso de Sucesso', 'Tendências-Aplicação', 'Análise de Campanha', 'Guia Prático'],
      keyTechniques: [
        'Use casos reais e métricas',
        'Apresente estratégias acionáveis',
        'Analise tendências atuais',
        'Foque em ROI e resultados',
        'Use exemplos de campanhas'
      ],
      languageStyle: 'Estratégica, orientada a resultados, atual. Use métricas e KPIs. Seja prático.',
      hookExamples: [
        'Esta campanha gerou [métrica] em [tempo]...',
        'A tendência de marketing que vai dominar [ano]...',
        'O erro que faz campanhas falharem...'
      ],
      pacingGuidance: 'Ritmo médio a rápido. Mantenha energia. Muitas informações práticas.',
      ctaStyle: 'Ação de marketing: "Implemente esta estratégia", "Baixe o template", "Teste A/B"'
    },
    cooking: {
      niche: 'cooking',
      name: 'Culinária',
      preferredStructures: ['Receita Passo-a-Passo', 'Técnica-Demonstração', 'Dica Prática', 'Comparação de Métodos'],
      keyTechniques: [
        'Seja específico com ingredientes e quantidades',
        'Explique técnicas culinárias',
        'Use linguagem sensorial (sabor, textura, aroma)',
        'Inclua dicas e truques',
        'Crie desejo pelo prato'
      ],
      languageStyle: 'Descritiva, sensorial, prática. Use adjetivos que despertem os sentidos.',
      hookExamples: [
        'Esta receita vai te surpreender com [sabor/textura]...',
        'O segredo para [resultado] que chefs usam...',
        'Você nunca mais vai fazer [prato] de outra forma...'
      ],
      pacingGuidance: 'Ritmo médio. Permita tempo para mostrar técnicas. Crie atmosfera acolhedora.',
      ctaStyle: 'Ação culinária: "Faça e me mostre", "Experimente esta receita", "Compartilhe sua versão"'
    },
    fitness: {
      niche: 'fitness',
      name: 'Fitness',
      preferredStructures: ['Treino-Demonstração', 'Transformação Antes-Depois', 'Dica Técnica', 'Motivação-Ação'],
      keyTechniques: [
        'Seja específico com exercícios e séries',
        'Explique técnica correta',
        'Use motivação e encorajamento',
        'Foque em resultados e progresso',
        'Inclua avisos de segurança'
      ],
      languageStyle: 'Energética, motivadora, técnica. Use linguagem que inspire ação.',
      hookExamples: [
        'Este treino queima [calorias] em [tempo]...',
        'O exercício que transformou [resultado]...',
        'A técnica que vai melhorar seu [objetivo]...'
      ],
      pacingGuidance: 'Ritmo rápido a médio. Mantenha energia alta. Motive constantemente.',
      ctaStyle: 'Ação fitness: "Faça este treino agora", "Me mostre seu progresso", "Comece hoje"'
    },
    travel: {
      niche: 'travel',
      name: 'Viagens',
      preferredStructures: ['Guia de Destino', 'Dicas Práticas', 'Roteiro de Viagem', 'Experiência Pessoal'],
      keyTechniques: [
        'Use descrições visuais e sensoriais',
        'Inclua informações práticas (custo, tempo, dicas)',
        'Crie desejo de viajar',
        'Seja específico com locais e experiências',
        'Use storytelling de viagem'
      ],
      languageStyle: 'Descritiva, inspiradora, prática. Use linguagem que transporte o espectador.',
      hookExamples: [
        'Este lugar vai te surpreender com [experiência]...',
        'A viagem que mudou minha perspectiva sobre...',
        'Você precisa conhecer [lugar] porque...'
      ],
      pacingGuidance: 'Ritmo médio. Permita tempo para apreciar imagens/descrições. Crie atmosfera de descoberta.',
      ctaStyle: 'Ação de viagem: "Planeje sua viagem", "Salve este destino", "Me conte sua experiência"'
    },
    general: {
      niche: 'general',
      name: 'Geral',
      preferredStructures: ['Problema-Solução', 'Storytelling', 'Hook-Desenvolvimento-CTA', 'Lista/Top N'],
      keyTechniques: [
        'Use estrutura clara e progressiva',
        'Mantenha engajamento constante',
        'Crie conexão com o público',
        'Use exemplos relevantes',
        'Termine com ação clara'
      ],
      languageStyle: 'Clara, envolvente, adaptável. Ajuste ao público-alvo do tópico.',
      hookExamples: [
        'Você precisa saber sobre [tópico] porque...',
        'Isso vai mudar sua perspectiva sobre...',
        'A verdade sobre [tópico] que ninguém te conta...'
      ],
      pacingGuidance: 'Ritmo médio. Adapte ao conteúdo específico.',
      ctaStyle: 'Ação geral: "Experimente", "Compartilhe", "Me conte sua opinião"'
    },
  };

  return configs[niche];
}

