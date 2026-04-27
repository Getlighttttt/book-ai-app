import express from 'express'
import { supabase } from '../lib/supabase.js'

if (!supabase) {
  console.warn(
    'Supabase client is not configured. History routes will not work.'
  )
}

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([])
    }

    const { data, error } = await supabase
      .from('book_analyses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to load history',
      })
    }

    const history = data.map((item) => ({
      id: item.id,
      imageUrl: item.image_url,
      recognizedTitle: item.recognized_title,
      recognizedAuthor: item.recognized_author,
      selectedReason: item.selected_reason,
      createdAt: item.created_at,
      book: {
        title: item.book_title,
        authors: item.book_authors || [],
        googleBooksId: item.google_books_id,
        publishedDate: item.published_date,
        displayPublishedYear: item.display_published_year,
        thumbnail: item.thumbnail,
        description: item.description,
      },
      analysis: {
        genre: item.genre,
        summary: item.summary,
        recommendations: item.recommendations || [],
        originalPublicationYear: item.original_publication_year,
      },
    }))

    return res.json(history)
  } catch (error) {
    console.error('History load error occurred')

    return res.status(500).json({
      error: 'Failed to load history',
    })
  }
})

router.post('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: 'Database is not configured',
      })
    }

    const bookData = req.body

    const id = bookData.id || crypto.randomUUID()
    const createdAt = bookData.createdAt || new Date().toISOString()

    const { error } = await supabase
      .from('book_analyses')
      .insert([
        {
          id,
          created_at: createdAt,
          recognized_title: bookData.recognizedTitle || null,
          recognized_author: bookData.recognizedAuthor || null,

          book_title: bookData.book?.title || null,
          book_authors: bookData.book?.authors || [],
          google_books_id: bookData.book?.googleBooksId || null,
          published_date: bookData.book?.publishedDate || null,
          display_published_year: bookData.book?.displayPublishedYear || null,

          original_publication_year:
            bookData.analysis?.originalPublicationYear || null,
          genre: bookData.analysis?.genre || null,
          summary: bookData.analysis?.summary || null,
          recommendations: bookData.analysis?.recommendations || [],

          thumbnail: bookData.book?.thumbnail || null,
          description: bookData.book?.description || null,
          selected_reason: bookData.selectedReason || null,
          image_url: bookData.imageUrl || null,
          raw_data: bookData,
        },
      ])

    if (error) {
      return res.status(500).json({
        error: 'Failed to save history',
      })
    }

    return res.status(201).json({
      ...bookData,
      id,
      createdAt,
    })
  } catch (error) {
    console.error('History save error occurred')

    return res.status(500).json({
      error: 'Failed to save history',
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: 'Database is not configured',
      })
    }

    const { id } = req.params

    const { error } = await supabase
      .from('book_analyses')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete history item',
      })
    }

    return res.json({
      success: true,
      id,
    })
  } catch (error) {
    console.error('History delete error occurred')

    return res.status(500).json({
      error: 'Failed to delete history item',
    })
  }
})

export default router