import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const HISTORY_STORAGE_KEY = 'ai-book-insight-history'
const LAST_RESULT_STORAGE_KEY = 'ai-book-insight-last-result'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

const mockResult = {
  id: crypto.randomUUID(),
  imageUrl:
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80',
  recognizedTitle: 'Atomic Habits',
  book: {
    title: 'Atomic Habits',
    authors: ['James Clear'],
    publishedDate: '2018-10-16',
    thumbnail:
      'https://books.google.com/books/publisher/content/images/frontcover/fFCjDQAAQBAJ?fife=w480',
    description:
      'A practical guide on building good habits, breaking bad habits, and making small changes that compound into remarkable results.',
  },
  analysis: {
    genre: 'Self-help / Productivity',
    summary:
      'The book explains how tiny improvements in daily systems can lead to long-term personal growth and consistent performance.',
    recommendations: [
      'Start with one tiny habit you can do in under 2 minutes.',
      'Use visual cues and habit tracking to stay consistent.',
      'Focus on systems instead of short-term goals.',
    ],
  },
  createdAt: new Date().toISOString(),
}

const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

export const saveLastResult = (data) => {
  localStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(data))
}

export const getLastResult = () => {
  const raw = localStorage.getItem(LAST_RESULT_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export const uploadBookImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const { data } = await api.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    const result = {
      ...data,
      id: data.id || crypto.randomUUID(),
      imageUrl: data.imageUrl || URL.createObjectURL(file),
      createdAt: data.createdAt || new Date().toISOString(),
    }

    saveLastResult(result)
    return result
  } catch {
    await delay()
    const fallback = {
      ...mockResult,
      id: crypto.randomUUID(),
      imageUrl: URL.createObjectURL(file),
      recognizedTitle: file.name.replace(/\.[^/.]+$/, '') || mockResult.recognizedTitle,
      createdAt: new Date().toISOString(),
    }
    saveLastResult(fallback)
    return fallback
  }
}

export const getHistory = async () => {
  try {
    const { data } = await api.get('/history')
    return data
  } catch {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }
}

export const saveBookToHistory = async (bookData) => {
  try {
    const { data } = await api.post('/history', bookData)
    return data
  } catch {
    const current = await getHistory()
    const withId = {
      ...bookData,
      id: bookData.id || crypto.randomUUID(),
      createdAt: bookData.createdAt || new Date().toISOString(),
    }
    const updated = [withId, ...current]
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
    return withId
  }
}

export const deleteHistoryItem = async (id) => {
  try {
    await api.delete(`/history/${id}`)
    return id
  } catch {
    const current = await getHistory()
    const updated = current.filter((item) => item.id !== id)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated))
    return id
  }
}
