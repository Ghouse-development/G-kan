import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateEmbedding, generateAIAnswer } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    const { query, mode, userId } = await request.json()

    const supabase = await createServerClient()

    // Log search (using any to bypass type issues)
    await (supabase as any).from('search_logs').insert({
      user_id: userId,
      query,
      search_type: mode,
    })

    if (mode === 'ai') {
      // AI semantic search using embeddings
      const embedding = await generateEmbedding(query)

      // Search for similar article embeddings
      const { data: similarChunks } = await (supabase as any).rpc('match_article_embeddings', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 10,
      })

      if (similarChunks && similarChunks.length > 0) {
        // Get unique article IDs
        const articleIds = Array.from(new Set(similarChunks.map((chunk: any) => chunk.article_id)))

        // Fetch full articles
        const { data: articles } = await supabase
          .from('articles')
          .select(`
            *,
            author:users!articles_author_id_fkey(display_name, avatar_url),
            folder:folders(id, name, color, icon)
          `)
          .in('id', articleIds)
          .eq('status', 'published')

        // Add similarity scores
        const results = articles?.map((article: any) => {
          const chunks = similarChunks.filter((c: any) => c.article_id === article.id)
          const maxSimilarity = Math.max(...chunks.map((c: any) => c.similarity))
          const matchedChunk = chunks.find((c: any) => c.similarity === maxSimilarity)

          return {
            ...article,
            similarity_score: maxSimilarity,
            matched_chunk: matchedChunk?.content_chunk,
          }
        })

        // Sort by similarity
        results?.sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))

        // Generate AI answer using top results
        const topArticles = results?.slice(0, 3) || []
        const context = topArticles
          .map((a) => `【${a.title}】\n${a.content.substring(0, 500)}`)
          .join('\n\n')

        const aiAnswer = await generateAIAnswer(query, context)

        return NextResponse.json({
          results: results || [],
          aiAnswer,
        })
      }

      return NextResponse.json({
        results: [],
        aiAnswer: '申し訳ございません。関連する情報が見つかりませんでした。',
      })
    } else {
      // Keyword search
      const { data: articles } = await supabase
        .from('articles')
        .select(`
          *,
          author:users!articles_author_id_fkey(display_name, avatar_url),
          folder:folders(id, name, color, icon)
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      // Update search log with results count (skip for now to avoid type issues)

      return NextResponse.json({
        results: articles || [],
      })
    }
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
