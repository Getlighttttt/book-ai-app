export const parseJsonFromText = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')

    if (start === -1 || end === -1) {
      throw new Error('Invalid JSON format')
    }

    const jsonString = cleaned.slice(start, end + 1)

    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error('Failed to parse AI response')
  }
}