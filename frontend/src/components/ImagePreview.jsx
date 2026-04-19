function ImagePreview({ src, alt = 'Uploaded preview' }) {
  if (!src) {
    return (
      <div className="image-preview image-preview-empty">
        <p>No image selected yet.</p>
      </div>
    )
  }

  return (
    <div className="image-preview">
      <img src={src} alt={alt} />
    </div>
  )
}

export default ImagePreview
