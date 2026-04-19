function BookCard({ item, onView, onDelete }) {
  return (
    <article className="card history-card">
      <img
        className="history-cover"
        src={item.book?.thumbnail || item.imageUrl}
        alt={item.book?.title || 'Book cover'}
      />
      <div className="history-content">
        <h3>{item.book?.title || 'Unknown title'}</h3>
        <p className="muted">Recognized: {item.recognizedTitle || 'N/A'}</p>
        <p>{item.analysis?.summary || 'No AI summary available.'}</p>
        <p className="muted">Added: {new Date(item.createdAt).toLocaleString()}</p>
        <div className="card-actions">
          <button className="btn btn-secondary" onClick={() => onView(item)}>
            View details
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default BookCard
