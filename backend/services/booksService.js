import axios from 'axios'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const searchBookCandidates = async (title, author) => {
  const query = `${title || ''} ${author || ''}`.trim()

  if (!query) {
    return []
  }

  const url = 'https://www.googleapis.com/books/v1/volumes'

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(url, {
        params: {
          q: query,
          maxResults: 20,
          key: process.env.GOOGLE_BOOKS_API_KEY,
        },
      })

      const items = response.data.items || []

      return items.map((item) => {
        const info = item.volumeInfo || {}

        return {
          googleBooksId: item.id,
          title: info.title || title || null,
          authors: info.authors || [],
          publishedDate: info.publishedDate || null,
          thumbnail: info.imageLinks?.thumbnail
            ? info.imageLinks.thumbnail.replace('http://', 'https://')
            : null,
          description: info.description || '',
          pageCount: info.pageCount || null,
          categories: info.categories || [],
          language: info.language || null,
        }
      })
    } catch (error) {
      if (error.response?.status === 503) {
        console.warn(`Google Books 503, retry ${attempt}...`)
        await sleep(1000 * attempt)
      } else {
        throw error
      }
    }
  }

  console.error('Google Books failed after retries')
  return []
}