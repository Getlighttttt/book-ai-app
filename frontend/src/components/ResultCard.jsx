function ResultCard({ result }) {
  if (!result) return null

  return (
    <section className="card result-card">
      <h2>Book Insight Result</h2>
      <div className="result-grid">
        <div>
          <h3>Recognized Title</h3>
          <p>{result.recognizedTitle || 'Not recognized'}</p>

          <h3>Google Books Match</h3>
          <p>
            <strong>Title:</strong> {result.book?.title || 'N/A'}
          </p>
          <p>
            <strong>Authors:</strong> {result.book?.authors?.join(', ') || 'N/A'}
          </p>
          <p>
            <strong>Published:</strong> {result.book?.publishedDate || 'N/A'}
          </p>
          {result.book?.description ? <p>{result.book.description}</p> : null}
        </div>

        <div>
          <img
            className="result-cover"
            src={result.book?.thumbnail || result.imageUrl}
            alt={result.book?.title || 'Book cover'}
          />
          <h3>AI Analysis</h3>
          <p>
            <strong>Genre:</strong> {result.analysis?.genre || 'N/A'}
          </p>
          <p>
            <strong>Short summary:</strong> {result.analysis?.summary || 'N/A'}
          </p>
          <div>
            <strong>Recommendations:</strong>
            <ul>
              {(result.analysis?.recommendations || []).map((rec) => (
                <li key={rec}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResultCard
