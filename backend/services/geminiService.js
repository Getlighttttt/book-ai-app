import { GoogleGenAI } from '@google/genai'
import { parseJsonFromText } from '../utils/parseJson.js'

const IMAGE_MODEL = 'gemini-2.5-flash'
const TEXT_MODEL = 'gemini-2.5-flash'
// 'gemini-3.1-flash-lite-preview'

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in .env')
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  })
}

export const detectBookFromImage = async (imageBuffer, mimeType) => {
  const ai = getGeminiClient()
  const base64Image = imageBuffer.toString('base64')

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      {
        text: `
          Look at this book cover image.

          Extract the most likely book title and author.
          If the cover is in Slovak, Czech, Ukrainian, Russian, or another language, return the internationally recognized English/original title and author name if possible.

          Examples:
          - "Harry Potter a Kameň mudrcov" -> "Harry Potter and the Philosopher's Stone"
          - "J. K. Rowlingová" -> "J. K. Rowling"

          Return only valid JSON:
          {
            "title": "...",
            "author": "..."
          }
        `,
      },
    ],
  })

  return parseJsonFromText(response.text)
}

export const selectBookAndGenerateAnalysis = async (detected, candidates) => {
  const ai = getGeminiClient()

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `
      You are helping select the correct book from Google Books results.

      Detected from book cover:
      Title: ${detected.title}
      Author: ${detected.author}

      Google Books candidates:
      ${JSON.stringify(candidates, null, 2)}

      Choose the best matching candidate.
      Prefer the real/main book over summaries, study guides, workbooks, audiobooks, previews, or unrelated editions.
      If multiple editions match, prefer:
      - the original language version
      - the earliest published edition
      - the most widely recognized/main edition

      Important:
      Google Books "publishedDate" can refer to a specific edition or reprint, not necessarily the original publication year.

      After selecting the book, generate an English analysis.

      If the original publication year of the book is reliably known, provide it.
      If you are not sure, return null.

      Return only valid JSON:
      {
        "selectedGoogleBooksId": "...",
        "selectionReason": "...",
        "analysis": {
          "genre": "...",
          "summary": "...",
          "recommendations": ["...", "...", "..."],
          "originalPublicationYear": 1997
        }
      }
    `,
  })

  return parseJsonFromText(response.text)
}