import OpenAI from 'openai'

// Initialize OpenAI only if API key is present
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

/**
 * Generate embedding vector for text using OpenAI ada-002
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    throw error
  }
}

/**
 * Generate AI answer based on query and context
 */
export async function generateAIAnswer(query: string, context: string): Promise<string> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `あなたは社内ナレッジマネジメントシステムのアシスタントです。
ユーザーの質問に対して、提供された社内資料の情報を元に、正確で分かりやすい回答を提供してください。
回答は簡潔かつ具体的にし、箇条書きを使って整理してください。
情報が不足している場合は、その旨を明記してください。`,
        },
        {
          role: 'user',
          content: `【質問】
${query}

【参考資料】
${context}

上記の資料を参考にして、質問に答えてください。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    })

    return response.choices[0].message.content || '回答を生成できませんでした。'
  } catch (error) {
    console.error('Failed to generate AI answer:', error)
    return '申し訳ございません。AI回答の生成に失敗しました。'
  }
}

/**
 * Generate embeddings for article content chunks
 */
export async function generateArticleEmbeddings(
  articleId: string,
  content: string
): Promise<Array<{ embedding: number[]; chunk: string; index: number }>> {
  // Split content into chunks (approximately 500 characters each)
  const chunkSize = 500
  const chunks: string[] = []

  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize))
  }

  // Generate embeddings for each chunk
  const embeddings = await Promise.all(
    chunks.map(async (chunk, index) => ({
      embedding: await generateEmbedding(chunk),
      chunk,
      index,
    }))
  )

  return embeddings
}
