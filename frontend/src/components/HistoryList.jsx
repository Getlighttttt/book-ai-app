import BookCard from './BookCard'

function HistoryList({ items, onView, onDelete }) {
  if (!items.length) {
    return (
      <div className="card empty-state">
        <h2>No history yet</h2>
        <p>Analyze and save a book to see it here.</p>
      </div>
    )
  }

  return (
    <div className="history-list">
      {items.map((item) => (
        <BookCard key={item.id} item={item} onView={onView} onDelete={onDelete} />
      ))}
    </div>
  )
}

export default HistoryList
