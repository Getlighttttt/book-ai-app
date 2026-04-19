import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import ImagePreview from '../components/ImagePreview'
import LoadingSpinner from '../components/LoadingSpinner'
import UploadBox from '../components/UploadBox'
import { uploadBookImage } from '../services/api'

function HomePage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a book image before analyzing.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await uploadBookImage(file)
      navigate('/result')
    } catch {
      setError('Failed to analyze the image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-grid">
      <div className="card">
        <h1>AI Book Insight</h1>
        <p className="lead">
          Upload a photo of a book and get an instant AI-powered analysis with
          enriched metadata and reading recommendations.
        </p>

        <UploadBox onFileChange={setFile} fileName={file?.name} />

        <div className="action-row">
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
            Analyze Book
          </button>
        </div>

        {loading ? <LoadingSpinner label="Analyzing your book image..." /> : null}
        <ErrorMessage message={error} />
      </div>

      <div className="card">
        <h2>Preview</h2>
        <ImagePreview src={previewUrl} alt="Selected book preview" />
      </div>
    </section>
  )
}

export default HomePage
