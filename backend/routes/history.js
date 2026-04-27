// backend/routes/history.js
import express from 'express'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase is not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.',
      })
    }

    const { data, error } = await supabase
      .from('book_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching history:', error)
      return res.status(500).json({ error: 'Failed to fetch history.' })
    }

    return res.json(data ?? [])
  } catch (err) {
    console.error('Unexpected history GET error:', err)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase is not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.',
      })
    }

    const { id } = req.params

    const { error } = await supabase
      .from('book_analyses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting history item:', error)
      return res.status(500).json({ error: 'Failed to delete history item.' })
    }

    return res.json({ success: true, deletedId: id })
  } catch (err) {
    console.error('Unexpected history DELETE error:', err)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
})

export default router