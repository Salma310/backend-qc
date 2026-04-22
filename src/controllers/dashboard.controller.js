import { prisma } from '../lib/prisma.js'

export async function getDashboardStats(req, res) {
  try {
    const [summary, monthlyTrend, methodStats, recentBatches, topFarmers, aiConfidence] =
      await Promise.all([
        getSummaryStats(),
        getMonthlyGradingTrend(),
        getGradingMethodStats(),
        _getRecentBatches(8),
        getTopFarmersByGradeA(5),
        getAIConfidenceStats(),
      ])
    return res.json({ success: true, data: { summary, monthlyTrend, methodStats, recentBatches, topFarmers, aiConfidence } })
  } catch (error) {
    console.error('[Dashboard] getDashboardStats error:', error)
    return res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard', error: error.message })
  }
}

export async function getSummary(req, res) {
  try {
    const data = await getSummaryStats()
    return res.json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil summary', error: error.message })
  }
}

export async function getMonthlyTrend(req, res) {
  try {
    const data = await getMonthlyGradingTrend()
    return res.json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil trend bulanan', error: error.message })
  }
}

export async function getRecentBatches(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 50)
    const data = await _getRecentBatches(limit)
    return res.json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil batch terbaru', error: error.message })
  }
}

export async function getTopFarmers(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20)
    const data = await getTopFarmersByGradeA(limit)
    return res.json({ success: true, data })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil top farmers', error: error.message })
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getSummaryStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalFarmers, activeFarmers, totalBatches, openBatches,
    totalGradings, gradingThisMonth, gradingLastMonth,
    gradeDistribution, gradeDistributionLastMonth,
  ] = await Promise.all([
    prisma.farmer.count(),
    prisma.farmer.count({ where: { is_active: true } }),
    prisma.batch.count(),
    prisma.batch.count({ where: { status: 'OPEN' } }),
    prisma.gradingResult.count(),
    prisma.gradingResult.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.gradingResult.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.gradingResult.groupBy({ by: ['grade'], where: { createdAt: { gte: startOfMonth } }, _count: { grade: true } }),
    prisma.gradingResult.groupBy({ by: ['grade'], where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _count: { grade: true } }),
  ])

  const formatGradeMap = (rows) => {
    const map = { A: 0, B: 0, C: 0, REJECT: 0 }
    rows.forEach((r) => { map[r.grade] = r._count.grade })
    return map
  }

  const gradingGrowth = gradingLastMonth === 0
    ? 100
    : Math.round(((gradingThisMonth - gradingLastMonth) / gradingLastMonth) * 100)

  return {
    farmers: { total: totalFarmers, active: activeFarmers },
    batches: { total: totalBatches, open: openBatches },
    gradings: { total: totalGradings, thisMonth: gradingThisMonth, lastMonth: gradingLastMonth, growth: gradingGrowth },
    gradeThisMonth: formatGradeMap(gradeDistribution),
    gradeLastMonth: formatGradeMap(gradeDistributionLastMonth),
  }
}

async function getMonthlyGradingTrend() {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return {
      label: d.toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    }
  })

  const allGradings = await prisma.gradingResult.findMany({
    where: { createdAt: { gte: months[0].start, lte: months[months.length - 1].end } },
    select: { grade: true, createdAt: true },
  })

  return months.map(({ label, start, end }) => {
    const inMonth = allGradings.filter((g) => g.createdAt >= start && g.createdAt <= end)
    const countMap = { A: 0, B: 0, C: 0, REJECT: 0 }
    inMonth.forEach((g) => { countMap[g.grade]++ })
    return { label, ...countMap, total: inMonth.length }
  })
}

async function getGradingMethodStats() {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const [methodAll, methodThisMonth] = await Promise.all([
    prisma.gradingResult.groupBy({ by: ['grading_method'], _count: { grading_method: true } }),
    prisma.gradingResult.groupBy({ by: ['grading_method'], where: { createdAt: { gte: startOfMonth } }, _count: { grading_method: true } }),
  ])

  const format = (rows) => {
    const map = { AI: 0, MANUAL: 0 }
    rows.forEach((r) => { map[r.grading_method] = r._count.grading_method })
    return map
  }

  return { allTime: format(methodAll), thisMonth: format(methodThisMonth) }
}

async function _getRecentBatches(limit = 8) {
  const batches = await prisma.batch.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      farmer: { select: { name: true, farmer_code: true } },
      land: { select: { land_name: true, land_code: true } },
      created_by: { select: { name: true } },
      _count: { select: { gradings: true } },
    },
  })

  return batches.map((b) => ({
    id: b.id, lot_code: b.lot_code, status: b.status,
    fruit_type: b.fruit_type, harvest_date: b.harvest_date,
    harvest_weight: b.harvest_weight, total_fruits: b.total_fruits,
    total_grade_a: b.total_grade_a, total_grade_b: b.total_grade_b,
    total_grade_c: b.total_grade_c, total_reject: b.total_reject,
    grading_count: b._count.gradings,
    farmer: b.farmer, land: b.land, created_by: b.created_by, createdAt: b.createdAt,
  }))
}

async function getTopFarmersByGradeA(limit = 5) {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const results = await prisma.batch.findMany({
    where: { gradings: { some: { grade: 'A', createdAt: { gte: startOfMonth } } } },
    include: {
      farmer: { select: { id: true, name: true, farmer_code: true } },
      _count: { select: { gradings: true } },
    },
  })

  const farmerMap = {}
  for (const batch of results) {
    const fid = batch.farmer.id
    if (!farmerMap[fid]) farmerMap[fid] = { farmer: batch.farmer, gradeA: 0, totalGrading: 0 }
    farmerMap[fid].gradeA += batch.total_grade_a
    farmerMap[fid].totalGrading += batch._count.gradings
  }

  return Object.values(farmerMap).sort((a, b) => b.gradeA - a.gradeA).slice(0, limit)
}

async function getAIConfidenceStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [thisMonth, lastMonth] = await Promise.all([
    prisma.gradingResult.aggregate({ where: { grading_method: 'AI', createdAt: { gte: startOfMonth }, confidence_avg: { not: null } }, _avg: { confidence_avg: true }, _count: { confidence_avg: true } }),
    prisma.gradingResult.aggregate({ where: { grading_method: 'AI', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, confidence_avg: { not: null } }, _avg: { confidence_avg: true }, _count: { confidence_avg: true } }),
  ])

  const round = (v) => v ? Math.round(v * 100) / 100 : null

  return {
    thisMonth: { avg: round(thisMonth._avg.confidence_avg), count: thisMonth._count.confidence_avg },
    lastMonth: { avg: round(lastMonth._avg.confidence_avg), count: lastMonth._count.confidence_avg },
  }
}