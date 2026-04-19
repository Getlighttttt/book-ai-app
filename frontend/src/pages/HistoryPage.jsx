import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import HistoryList from '../components/HistoryList'
import LoadingSpinner from '../components/LoadingSpinner'
import { deleteHistoryItem, getHistory, saveLastResult } from '../services/api'

function HistoryPage() {
  const navigate = useNavigate()
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    getHistory()
      .then((data) => {
        if (isMounted) {
          setHistoryItems(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load history. Please refresh the page.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleView = (item) => {
    saveLastResult(item)
    navigate('/result')
  }

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id)
      setHistoryItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setError('Could not delete this item right now.')
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading history..." />
  }

  return (
    <section className="stacked-layout">
      <div>
        <h1>History</h1>
        <p className="lead">All books saved from your previous analyses.</p>
      </div>
      <ErrorMessage message={error} />
      <HistoryList items={historyItems} onView={handleView} onDelete={handleDelete} />
    </section>
  )
}

export default HistoryPage
