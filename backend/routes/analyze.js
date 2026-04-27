import express from 'express'
import multer from 'multer'
import {
  detectBookFromImage,
  selectBookAndGenerateAnalysis,
} from '../services/geminiService.js'
import { searchBookCandidates } from '../services/booksService.js'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
})

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    const detected = await detectBookFromImage(
      req.file.buffer,
      req.file.mimetype
    )

    const candidates = await searchBookCandidates(
      detected.title,
      detected.author
    )

    if (!candidates.length) {
      return res.status(404).json({
        error: 'Book not found',
        recognizedTitle: detected.title || null,
        recognizedAuthor: detected.author || null,
      })
    }

    const selectedResult = await selectBookAndGenerateAnalysis(
      detected,
      candidates
    )

    let selectedBook = candidates.find(
      (candidate) =>
        candidate.googleBooksId === selectedResult.selectedGoogleBooksId
    )

    if (!selectedBook) {
      console.warn(
        'Selected Google Books ID was not found. Falling back to first candidate.'
      )

      selectedBook = candidates[0]
    }

    const finalBook = {
      ...selectedBook,
      authors: selectedBook.authors?.length
        ? selectedBook.authors
        : detected.author
          ? [detected.author]
          : ['Unknown'],

      editionPublishedYear: selectedBook.publishedDate
        ? selectedBook.publishedDate.slice(0, 4)
        : null,

      displayPublishedYear:
        selectedResult.analysis?.originalPublicationYear ||
        (selectedBook.publishedDate ? selectedBook.publishedDate.slice(0, 4) : null),
    }

    const finalAnalysis = {
      genre: selectedResult.analysis?.genre || 'Unknown',
      summary: selectedResult.analysis?.summary || 'Analysis was not available.',
      recommendations: Array.isArray(selectedResult.analysis?.recommendations)
        ? selectedResult.analysis.recommendations
        : [],
      originalPublicationYear:
        selectedResult.analysis?.originalPublicationYear || null,
    }

    const responseData = {
      id: crypto.randomUUID(),
      imageUrl: null,
      recognizedTitle: detected.title || finalBook.title || null,
      recognizedAuthor: detected.author || finalBook.authors?.[0] || null,
      book: finalBook,
      analysis: finalAnalysis,
      selectedReason: selectedResult.selectionReason || null,
      createdAt: new Date().toISOString(),
    }

if (supabase) {
  const { error: insertError } = await supabase
    .from('book_analyses')
    .insert([
      {
        id: responseData.id,
        created_at: responseData.createdAt,
        recognized_title: responseData.recognizedTitle,
        recognized_author: responseData.recognizedAuthor,
        book_title: responseData.book?.title || null,
        book_authors: responseData.book?.authors || [],
        google_books_id: responseData.book?.googleBooksId || null,
        published_date: responseData.book?.publishedDate || null,
        display_published_year: responseData.book?.displayPublishedYear || null,
        original_publication_year:
          responseData.analysis?.originalPublicationYear || null,
        genre: responseData.analysis?.genre || null,
        summary: responseData.analysis?.summary || null,
        recommendations: responseData.analysis?.recommendations || [],
        thumbnail: responseData.book?.thumbnail || null,
        description: responseData.book?.description || null,
        selected_reason: responseData.selectedReason || null,
        image_url: responseData.imageUrl || null,
        raw_data: responseData,
      },
    ])

  if (insertError) {
    console.error('Supabase insert error:', insertError)

    return res.status(500).json({
      error: 'Failed to save history',
      details: insertError.message,
      code: insertError.code || null,
    })
  }

  console.log('Supabase insert success:', responseData.id)
}

    return res.json(responseData)
  } catch (error) {
  console.error('Analyze error:', error.message)

  return res.status(500).json({
    error: 'Failed to analyze image',
  })
  }
})

export default router