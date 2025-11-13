import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const articleId = formData.get('articleId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${session.user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    // Save file metadata to database
    const { data: fileData, error: dbError } = await (supabase as any)
      .from('files')
      .insert({
        article_id: articleId || null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        uploaded_by: session.user.id,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({
      file: fileData,
      url: publicUrl,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    const supabase = await createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase.from('files').select('*')

    if (articleId) {
      query = query.eq('article_id', articleId)
    } else {
      query = query.eq('uploaded_by', session.user.id)
    }

    const { data: files } = await query.order('created_at', { ascending: false })

    return NextResponse.json({ files: files || [] })
  } catch (error: any) {
    console.error('Fetch files error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
