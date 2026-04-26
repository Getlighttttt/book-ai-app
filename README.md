## Member 2 — Backend & API Integration

### Responsibility
Responsible for implementing the backend logic, API endpoints, and integration with external cloud services. The backend serves as the core processing layer that connects the frontend with AI and data APIs.

---

## Backend Overview

The backend is built using **Node.js and Express** and is designed as a REST API. Its main purpose is to:

- receive an image from the frontend
- process it using an AI model (Google Gemini API)
- retrieve book data from Google Books API
- generate additional insights (genre, summary, recommendations)
- return a structured JSON response to the frontend

The backend is deployed on **Render** and communicates with the frontend hosted on **Vercel**.

---

## Processing Pipeline

Frontend → Upload image  
→ Backend (/api/analyze)  
→ Gemini API (image → title + author)  
→ Google Books API (get candidates)  
→ Gemini API (select best + analyze)  
→ Backend (format response)  
→ Frontend (display result)

---

## API Endpoints

### POST /api/analyze

Main endpoint of the application.

**Input:**
- multipart/form-data
- image file (book cover)

**Processing steps:**
1. Validate input (check if file exists)
2. Convert image to Base64
3. Send image to Gemini API for title and author detection
4. Extract book title and author
5. Query Google Books API for matching books
6. Send candidates back to Gemini
7. Select best match and generate analysis
8. Normalize and structure the final JSON response

**Output example:**

```json
{
  "recognizedTitle": "...",
  "recognizedAuthor": "...",
  "book": { ... },
  "analysis": {
    "genre": "...",
    "summary": "...",
    "recommendations": ["...", "..."],
    "originalPublicationYear": 1997
  }
}
```

---

### GET /api/status

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

---

## Core Components

### 1. Image Upload Handling

- Implemented using multer
- Uses in-memory storage (no disk writes)
- File size limit to prevent abuse

Example:

```js
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
})
```

---

### 2. Gemini API Integration (AI Processing)

Gemini is used in two stages:

a) Book Detection from Image
- Receives Base64 image
- Extracts book title and author
- Handles multilingual covers

b) Book Selection & Analysis
- Receives list of Google Books candidates
- Selects the most relevant book
- Generates:
  - genre
  - short summary
  - recommendations
  - original publication year (if known)

---

### 3. Google Books API Integration

- Searches books using detected title and author
- Retrieves multiple candidates
- Extracts metadata:
  - title
  - authors
  - description
  - categories
  - publishedDate
  - thumbnail

- Converts image URLs to HTTPS to avoid mixed content issues

---

### 4. Data Processing & Normalization

The backend ensures consistent output:

- fallback handling for missing authors
- extraction of publication year from full date
- separation of:
  - edition year (Google Books)
  - original publication year (AI)

Example logic:

displayPublishedYear =
  originalPublicationYear || editionPublishedYear

---

### 5. JSON Parsing from AI

Since AI responses may include formatting:

- removes markdown wrappers (\`\`\`json)
- extracts valid JSON substring
- parses using JSON.parse

---

### 6. Error Handling

The backend handles:

- missing file → 400 Bad Request
- no results → 404 Not Found
- API failures → retry or fallback
- unexpected errors → 500 Internal Server Error

Example:

```js
catch (error) {
  return res.status(500).json({
    error: 'Failed to analyze image',
  })
}
```

---

## Technologies Used

- Node.js
- Express.js
- Multer
- Axios
- Google Gemini API
- Google Books API
- dotenv
- CORS

---

## Security & Configuration

- API keys stored in environment variables:
  - GEMINI_API_KEY
  - GOOGLE_BOOKS_API_KEY

- CORS configured to allow only frontend origin

```js
app.use(cors({
  origin: process.env.FRONTEND_URL
}))
```

- sensitive data is not exposed to the frontend

---

## Cloud Architecture

- Frontend: Vercel
- Backend: Render
- AI service: Google Gemini
- Data API: Google Books API

This satisfies the requirement of using multiple cloud providers.

---

## Notes

- Backend is stateless, meaning no session or user-specific data is stored between requests.
- Each request is processed independently
- Retry logic is used to handle temporary failures of external APIs (e.g., 503 errors).
- System is modular and extendable (e.g., database can be added later)

---

## Summary

The backend:

- connects frontend with AI and external APIs
- processes images and extracts structured data
- selects the most relevant book intelligently
- generates additional insights using AI
- returns clean JSON responses

It represents the core logic and intelligence of the application.