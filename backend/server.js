import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import analyzeRoute from './routes/analyze.js'
import historyRoute from './routes/history.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}))

app.use(express.json())

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
  })
})

app.use('/api/analyze', analyzeRoute)
app.use('/api/history', historyRoute)

app.use((err, req, res, next) => {
  console.error('Server error:', err.message)

  res.status(500).json({
    error: 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})