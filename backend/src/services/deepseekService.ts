import https from 'https';
import { AutoInsight } from '../types';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call DeepSeek API to generate content
 */
async function callDeepSeekAPI(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  const messages: DeepSeekMessage[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const requestData: DeepSeekRequest = {
    model: 'deepseek-chat',
    messages,
    max_tokens: 4000,
    temperature: 0.7,
  };

  const data = JSON.stringify(requestData);

  const options = {
    hostname: 'api.deepseek.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response: DeepSeekResponse = JSON.parse(body);
            resolve(response.choices[0].message.content);
          } catch (error) {
            reject(new Error('Failed to parse DeepSeek API response'));
          }
        } else {
          reject(new Error(`DeepSeek API request failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Generate actionable recommendations based on insights using DeepSeek
 */
export async function generateRecommendations(
  insights: AutoInsight[],
  metricsContext?: {
    revenue: number;
    sales: number;
    avgTicket: number;
    cancelRate: number;
  }
): Promise<string[]> {
  if (insights.length === 0) {
    return [];
  }

  // Prioritize actionable insights, but include all for context
  const actionableInsights = insights.filter(i => i.actionable);
  const infoInsights = insights.filter(i => !i.actionable);

  if (actionableInsights.length === 0 && infoInsights.length === 0) {
    return [];
  }

  const systemPrompt = `Você é um consultor especialista em gestão de restaurantes com 15+ anos de experiência.
Você analisa dados de vendas e gera recomendações CONCRETAS e ESPECÍFICAS que donos de restaurante possam implementar HOJE.

PRINCÍPIOS:
- NUNCA seja genérico ("melhore o marketing", "otimize operações")
- SEMPRE mencione nomes específicos (produtos, lojas, horários) dos insights
- SEMPRE quantifique impacto esperado ("aumentar 15%", "reduzir cancelamentos para 8%")
- SEMPRE defina prazo de implementação ("nos próximos 3 dias", "esta semana")
- Foque em ações que custam pouco e geram alto impacto

Responda em português do Brasil.`;

  // Build detailed context with specific data points
  let prompt = `Analise estes insights de um restaurante e gere 4-6 recomendações ULTRA-ESPECÍFICAS:\n\n`;

  // Add actionable insights with emphasis
  if (actionableInsights.length > 0) {
    prompt += `📊 PROBLEMAS IDENTIFICADOS (requerem ação):\n`;
    actionableInsights.forEach((insight, idx) => {
      prompt += `\n${idx + 1}. ${insight.title}\n`;
      prompt += `   Descrição: ${insight.description}\n`;
      if (insight.metric && insight.change !== undefined) {
        prompt += `   Métrica: ${insight.metric} | Variação: ${insight.change.toFixed(1)}%\n`;
      }
      prompt += `   Severidade: ${insight.severity}\n`;
    });
  }

  // Add informational insights for additional context
  if (infoInsights.length > 0) {
    prompt += `\n💡 INFORMAÇÕES ADICIONAIS (para contextualizar):\n`;
    infoInsights.forEach((insight, idx) => {
      prompt += `\n${idx + 1}. ${insight.title}: ${insight.description}\n`;
    });
  }

  // Add metrics context
  if (metricsContext) {
    prompt += `\n📈 CONTEXTO ATUAL DO NEGÓCIO:\n`;
    prompt += `   • Faturamento período: R$ ${metricsContext.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    prompt += `   • Total de vendas: ${metricsContext.sales} pedidos\n`;
    prompt += `   • Ticket médio: R$ ${metricsContext.avgTicket.toFixed(2)}\n`;
    prompt += `   • Taxa cancelamento: ${metricsContext.cancelRate.toFixed(1)}%\n`;
  }

  prompt += `\n🎯 GERE RECOMENDAÇÕES SEGUINDO ESTE FORMATO:

Para cada problema, forneça uma recomendação ESPECÍFICA que:
1. MENCIONE o produto/loja/horário EXATO citado no insight
2. DEFINA a ação precisa a tomar (ex: "Criar combo Pizza Margherita P + Refrigerante por R$29,90")
3. QUANTIFIQUE o resultado esperado (ex: "para recuperar 10% do faturamento perdido")
4. INDIQUE quando implementar (ex: "nesta semana", "nas próximas 48h")

EXEMPLOS DE RECOMENDAÇÕES ESPECÍFICAS (use como referência de qualidade):
• "Criar promoção 2x1 na Pizza Margherita P na loja Cassiano - Guerra para domingo 19h-21h (horário de pico identificado), com meta de aumentar o faturamento em 15% nos próximos 7 dias"
• "Investigar motivo da queda de 21.5% na loja Cassiano - Guerra: fazer reunião com gerente hoje para revisar qualidade de atendimento, tempo de entrega e problemas operacionais"
• "Reduzir taxa de cancelamento de ${metricsContext?.cancelRate.toFixed(1)}% para 8%: implementar confirmação por WhatsApp 15min após pedido e revisar tempo estimado de entrega para ser mais realista"

Forneça EXATAMENTE entre 4 e 6 recomendações.
Use o formato: uma linha por recomendação, iniciando com "•"
Seja CIRÚRGICO nas ações propostas.`;

  try {
    console.log('🤖 Calling DeepSeek API for recommendations...');
    const response = await callDeepSeekAPI(prompt, systemPrompt);
    console.log('✅ DeepSeek API response received');

    // Parse the response into individual recommendations
    const recommendations = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('•') || line.match(/^\d+\.\s/))
      .map(line => line.replace(/^[•\d.]\s*/, '').trim())
      .filter(line => line.length > 20); // Filter out very short lines

    if (recommendations.length === 0) {
      console.warn('⚠️ No valid recommendations parsed from DeepSeek response');
      throw new Error('No valid recommendations in response');
    }

    console.log(`✅ Generated ${recommendations.length} recommendations`);
    return recommendations.slice(0, 6); // Max 6 recommendations
  } catch (error) {
    console.error('❌ Error generating recommendations with DeepSeek:', error);

    // Generate smarter fallback based on actual insights
    const fallbackRecommendations: string[] = [];

    actionableInsights.forEach(insight => {
      if (insight.title.includes('Faturamento') && insight.change && insight.change < 0) {
        fallbackRecommendations.push(
          `Reverter queda de ${Math.abs(insight.change).toFixed(1)}% no faturamento: revisar preços, lançar promoções nos produtos mais vendidos e intensificar marketing nos próximos 7 dias`
        );
      } else if (insight.title.includes('Volume de Vendas') && insight.change && insight.change < 0) {
        fallbackRecommendations.push(
          `Recuperar volume de vendas: criar campanha de cupom de desconto de 15% para clientes inativos nos últimos 15 dias, com meta de reativar 20% deles esta semana`
        );
      } else if (insight.title.includes('Cancelamento')) {
        fallbackRecommendations.push(
          `Reduzir taxa de cancelamento: implementar confirmação automática por WhatsApp e revisar tempo estimado de entrega para ser mais realista nos próximos 3 dias`
        );
      } else if (insight.title.includes('Loja') && insight.description.includes('queda')) {
        const storeName = insight.description.match(/loja (.+?) teve/)?.[1];
        if (storeName) {
          fallbackRecommendations.push(
            `Investigar urgentemente a queda na loja ${storeName}: agendar reunião com gerente hoje para revisar qualidade, atendimento e problemas operacionais`
          );
        }
      }
    });

    // Add generic ones only if we don't have enough specific ones
    if (fallbackRecommendations.length < 3) {
      fallbackRecommendations.push(
        'Analisar histórico de pedidos nos horários de pico identificados para otimizar equipe e reduzir tempo de preparo em 20%'
      );
    }

    if (fallbackRecommendations.length < 4) {
      infoInsights.forEach(insight => {
        if (insight.title.includes('Produto Destaque') && insight.description) {
          const productName = insight.description.match(/^(.+?) é seu/)?.[1];
          if (productName && fallbackRecommendations.length < 5) {
            fallbackRecommendations.push(
              `Criar combo promocional com ${productName} (produto mais vendido) + acompanhamento por R$ 10 a menos que o preço separado, para aumentar ticket médio em 15%`
            );
          }
        }
      });
    }

    return fallbackRecommendations.slice(0, 5);
  }
}

/**
 * Generate detailed analysis for specific metrics or issues
 */
export async function generateDetailedAnalysis(
  topic: string,
  context: any
): Promise<string> {
  const systemPrompt = `Você é um consultor especialista em análise de dados para restaurantes.
Forneça análises detalhadas, objetivas e acionáveis baseadas nos dados fornecidos.`;

  const prompt = `Analise o seguinte tópico e forneça insights detalhados:

TÓPICO: ${topic}

DADOS:
${JSON.stringify(context, null, 2)}

Forneça uma análise estruturada incluindo:
1. Principais observações
2. Possíveis causas
3. Recomendações específicas`;

  try {
    return await callDeepSeekAPI(prompt, systemPrompt);
  } catch (error) {
    console.error('Error generating detailed analysis with DeepSeek:', error);
    return 'Não foi possível gerar a análise detalhada no momento. Por favor, tente novamente.';
  }
}

export default {
  generateRecommendations,
  generateDetailedAnalysis,
};
