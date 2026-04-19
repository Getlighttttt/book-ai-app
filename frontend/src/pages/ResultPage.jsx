import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import ImagePreview from '../components/ImagePreview'
import ResultCard from '../components/ResultCard'
import { getLastResult, saveBookToHistory } from '../services/api'

function ResultPage() {
  const navigate = useNavigate()
  const result = getLastResult()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!result) return

    try {
      await saveBookToHistory(result)
      setSaved(true)
      setError('')
    } catch {
      setError('Could not save to history. Please try again.')
    }
  }

  if (!result) {
    return (
      <div className="card empty-state">
        <h2>No result available</h2>
        <p>Analyze a book image first to see results.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <section className="stacked-layout">
      <div className="card">
        <h2>Uploaded Image</h2>
        <ImagePreview src={result.imageUrl} alt="Uploaded book image" />
      </div>

      <ResultCard result={result} />

      <div className="card-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back to Home
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saved}>
          {saved ? 'Saved to History' : 'Save to History'}
        </button>
      </div>

      <ErrorMessage message={error} />
    </section>
  )
}

export default ResultPage
