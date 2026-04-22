import { Router } from 'express'
import {
  getDashboardStats,
  getSummary,
  getMonthlyTrend,
  getRecentBatches,
  getTopFarmers,
} from '../controllers/dashboard.controller.js'

const router = Router()

router.get('/stats', getDashboardStats)
router.get('/summary', getSummary)
router.get('/monthly-trend', getMonthlyTrend)
router.get('/recent-batches', getRecentBatches)
router.get('/top-farmers', getTopFarmers)

export default router