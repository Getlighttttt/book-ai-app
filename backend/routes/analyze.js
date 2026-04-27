import express from 'express'
import multer from 'multer'
import {
  detectBookFromImage,
  selectBookAndGenerateAnalysis,
} from '../services/geminiService.js'
import { searchBookCandidates } from '../services/booksService.js'

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

    return res.json(responseData)
  } catch (error) {
  console.error('Error in analyze')

  return res.status(500).json({
    error: 'Failed to analyze image',
  })
  }
})

export default router