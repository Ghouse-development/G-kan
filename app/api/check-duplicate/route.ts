import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json()

    if (!title && !content) {
      return NextResponse.json({ error: 'Title or content required' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate embedding for the new content
    const searchText = `${title}\n\n${content}`.substring(0, 1000)
    const embedding = await generateEmbedding(searchText)

    // Search for similar articles using vector search
    const { data: similarArticles } = await (supabase as any).rpc('match_article_embeddings', {
      query_embedding: embedding,
      match_threshold: 0.85, // High threshold for duplicates
      match_count: 5,
    })

    if (!similarArticles || similarArticles.length === 0) {
      return NextResponse.json({
        hasDuplicate: false,
        similarArticles: [],
      })
    }

    // Get full article details
    const articleIds = Array.from(new Set(similarArticles.map((item: any) => item.article_id)))
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        status,
        author:users!articles_author_id_fkey(display_name)
      `)
      .in('id', articleIds)
      .eq('status', 'published')

    // Calculate similarity scores
    const articlesWithScores = articles?.map((article: any) => {
      const chunks = similarArticles.filter((c: any) => c.article_id === article.id)
      const maxSimilarity = Math.max(...chunks.map((c: any) => c.similarity))

      return {
        ...article,
        similarity: maxSimilarity,
      }
    })

    // Sort by similarity
    articlesWithScores?.sort((a, b) => b.similarity - a.similarity)

    const hasDuplicate = articlesWithScores && articlesWithScores[0]?.similarity > 0.90

    return NextResponse.json({
      hasDuplicate,
      similarArticles: articlesWithScores || [],
      message: hasDuplicate
        ? '類似した記事が見つかりました。重複の可能性があります。'
        : similarArticles.length > 0
        ? '類似した記事がいくつか見つかりました。'
        : null,
    })
  } catch (error: any) {
    console.error('Duplicate check error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
