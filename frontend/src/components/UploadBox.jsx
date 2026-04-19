function UploadBox({ onFileChange, fileName }) {
  return (
    <label className="upload-box" htmlFor="book-image-upload">
      <input
        id="book-image-upload"
        type="file"
        accept="image/*"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />
      <span className="upload-title">Upload a book photo</span>
      <span className="upload-subtitle">
        Drag & drop or click to choose an image (JPG, PNG, WEBP)
      </span>
      {fileName ? <span className="upload-file">Selected: {fileName}</span> : null}
    </label>
  )
}

export default UploadBox
