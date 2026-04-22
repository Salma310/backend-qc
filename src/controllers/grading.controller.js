import { prisma } from "../lib/prisma.js";
import { generateGradingCode } from "../utils/codeGenerator.js";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import FormData from 'form-data'
import fetch    from 'node-fetch'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

/**
 * GET ALL GRADING
 */
export const getAllGrading = async (req, res) => {
  try {
    const { batch_id } = req.query
    console.log("batch_id query:", batch_id)

    const data = await prisma.gradingResult.findMany({
      where: batch_id ? { batch_id } : {},
      include: {
        batch: true,
        graded_by: {
          select: { id: true, name: true, role: true }
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(data)
  } catch (error) {
    console.error('❌ getAllGrading error:', error) // ← tambah ini
    res.status(500).json({ message: error.message })
  }
}

/**
 * CREATE GRADING
 */
export const createGrading = async (req, res) => {
  try {
    const { batch_id, grade: manualGrade, grading_method } = req.body
 
    // ── Validasi batch ────────────────────────────────────────────
    const batch = await prisma.batch.findUnique({ where: { id: batch_id } })
    if (!batch)
      return res.status(404).json({ error: 'Batch tidak ditemukan' })
    if (batch.status !== 'OPEN')
      return res.status(400).json({ error: 'Batch sudah ditutup' })
 
    // ── Rename & simpan foto ──────────────────────────────────────
    const grading_code  = await generateGradingCode(batch_id)
    const qr_token      = `${grading_code}-${nanoid(6)}`
    const uploadedFiles = req.files?.images || []
    const dateStr       = new Date().toISOString().split('T')[0].replace(/-/g, '')
 
    const renamedFiles = uploadedFiles.map((file, index) => {
      const ext     = path.extname(file.originalname)
      const newName = `${dateStr}-${grading_code}-${index + 1}${ext}`
      const newPath = path.join('uploads', newName)
      fs.renameSync(file.path, newPath)
      return `/uploads/${newName}`
    })
 
    // ── Verifikasi semua file benar-benar ada setelah rename ──────
    // Ini mencegah race condition saat processWithAI langsung jalan
    for (const filePath of renamedFiles) {
      const fullPath = path.join(process.cwd(), filePath)
      if (!fs.existsSync(fullPath)) {
        console.error(`❌ File tidak ditemukan setelah rename: ${fullPath}`)
        return res.status(500).json({ error: `File upload gagal: ${filePath}` })
      }
    }
 
    // ── Tentukan mode grading ─────────────────────────────────────
    const isAI = grading_method !== 'MANUAL'
 
    // ── Buat record DB awal ───────────────────────────────────────
    const result = await prisma.gradingResult.create({
      data: {
        grading_code,
        qr_token,
        image_urls:     renamedFiles,
        grading_method: isAI ? 'AI' : 'MANUAL',
        status:         isAI ? 'PROCESSING' : 'DONE',
        grade:          isAI ? null : manualGrade,
        batch: {
          connect: { id: batch_id }
        }
      },
    })
 
    console.log(`✅ Grading record dibuat: ${grading_code} | status: ${result.status}`)
 
    // ── MANUAL: langsung selesai ──────────────────────────────────
    if (!isAI) {
      await updateBatchSummary(batch_id, manualGrade)
      return res.status(201).json(result)
    }
 
    // ── AI: return 202 langsung, proses background ────────────────
    res.status(202).json({
      message:      'Sedang diproses AI',
      grading_id:   result.id,
      grading_code: result.grading_code,
      status:       'PROCESSING',
    })
 
    // Sedikit delay kecil untuk memastikan response sudah terkirim
    // sebelum background process mulai (opsional tapi membantu di Windows)
    setImmediate(() => {
      processWithAI(result.id, batch_id, renamedFiles).catch(err => {
        console.error(`❌ processWithAI unhandled error [${grading_code}]:`, err)
      })
    })
 
  } catch (error) {
    console.error('createGrading error:', error)
    res.status(500).json({ message: error.message })
  }
}
 
 
/**
 * Background worker: kirim foto ke Python, update DB
 */
async function processWithAI(gradingId, batchId, fileUrls) {
  console.log(`\n🤖 processWithAI START [${gradingId}]`)
  console.log(`   Files: ${fileUrls.join(', ')}`)
 
  try {
    // ── Verifikasi file ada sebelum kirim ke Python ───────────────
    const aiForm = new FormData()
    for (const filePath of fileUrls) {
      const fullPath = path.join(process.cwd(), filePath)
 
      // Cek file benar-benar ada dan bisa dibaca
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File tidak ditemukan: ${fullPath}`)
      }
 
      const stat = fs.statSync(fullPath)
      if (stat.size === 0) {
        throw new Error(`File kosong (0 bytes): ${fullPath}`)
      }
 
      console.log(`   📎 Append file: ${path.basename(fullPath)} (${stat.size} bytes)`)
      aiForm.append('images', fs.createReadStream(fullPath), path.basename(fullPath))
    }
 
    console.log(`   🚀 Mengirim ${fileUrls.length} foto ke Python...`)
 
    // ── Panggil Python AI service ─────────────────────────────────
    const aiRes = await fetch(`${AI_SERVICE_URL}/grade`, {
      method:  'POST',
      body:    aiForm,
      headers: aiForm.getHeaders(),
      // Timeout 60 detik — cukup untuk proses YOLO + CNN
      signal:  AbortSignal.timeout(60000),
    })
 
    if (!aiRes.ok) {
      const errText = await aiRes.text()
      throw new Error(`Python API error ${aiRes.status}: ${errText}`)
    }
 
    const aiData = await aiRes.json()
    console.log(`   📊 Python response:`, JSON.stringify(aiData).slice(0, 200))
 
    // ── Gagal dari Python → update ERROR ─────────────────────────
    if (!aiData.success) {
      console.warn(`   ⚠ Python: ${aiData.error_code} — ${aiData.message}`)
      await prisma.gradingResult.update({
        where: { id: gradingId },
        data: {
          status:        'ERROR',
          ai_result:     aiData,
          error_message: aiData.message || 'Jambu tidak terdeteksi',
        },
      })
      return
    }
 
    // ── Sukses → update record ────────────────────────────────────
    await prisma.gradingResult.update({
      where: { id: gradingId },
      data: {
        status:          'DONE',
        grade:           aiData.grade,
        confidence:      aiData.confidence_avg,
        confidence_avg:  aiData.confidence_avg,
        total_detected:  aiData.total_detected,
        consistency:     aiData.consistency,
        defect_detected: aiData.defect_detected,
        ai_result:       aiData.ai_result,
      },
    })
 
    await updateBatchSummary(batchId, aiData.grade)
    console.log(`   ✅ processWithAI DONE [${gradingId}] → grade ${aiData.grade}`)
 
  } catch (err) {
    console.error(`   ❌ processWithAI FAILED [${gradingId}]:`, err.message)
    console.error(err.stack)
 
    // Update DB ke ERROR dengan pesan yang jelas
    await prisma.gradingResult.update({
      where: { id: gradingId },
      data: {
        status:        'ERROR',
        error_message: err.message,
      },
    }).catch(dbErr => {
      console.error(`   ❌ Gagal update status ERROR ke DB:`, dbErr.message)
    })
  }
}
 
 
/**
 * GET /api/gradings/:id/status
 */
export const getGradingStatus = async (req, res) => {
  try {
    const grading = await prisma.gradingResult.findUnique({
      where: { id: req.params.id },
      select: {
        id:              true,
        grading_code:    true,
        status:          true,
        grade:           true,
        confidence:      true,
        defect_detected: true,
        error_message:   true,
        ai_result:       true,
      },
    })
    if (!grading) return res.status(404).json({ error: 'Not found' })
    res.json(grading)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
 


// ── Helpers ─────────────────────────────────────────────────────
async function updateBatchSummary(batchId, grade) {
  const updateData = { total_fruits: { increment: 1 } }
  if (grade === 'A')      updateData.total_grade_a = { increment: 1 }
  else if (grade === 'B') updateData.total_grade_b = { increment: 1 }
  else if (grade === 'C') updateData.total_grade_c = { increment: 1 }
  else if (grade === 'REJECT') updateData.total_reject = { increment: 1 }
  await prisma.batch.update({ where: { id: batchId }, data: updateData })
}

/**
 * GET GRADING BY ID
 */
export const getGradingById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.gradingResult.findUnique({
      where: { id },
      include: {
        batch: true,
        graded_by: true,
        qr_logs: true,
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Grading not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGradingByQr = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const data = await prisma.gradingResult.findUnique({
      where: { qr_token: qrToken },
      include: {
        batch: {
          include: {
            farmer: true,
            land: true,
          },
        },
        graded_by: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!data) {
      return res.status(404).json({ message: "QR tidak ditemukan atau tidak valid" });
    }

    if (!data.qr_is_active) {
      return res.status(403).json({ message: "QR sudah tidak aktif" });
    }

    // Catat access log
    await prisma.qRAccessLog.create({
      data: {
        grading_id: data.id,
        device_type: req.headers["user-agent"]?.includes("Mobile") ? "Mobile" : "Desktop",
        ip_address: req.ip || req.headers["x-forwarded-for"] || null,
        user_agent: req.headers["user-agent"] || null,
        location: null, // isi dari GPS kalau frontend kirim
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE GRADING
 */
export const updateGrading = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.gradingResult.update({
      where: { id },
      data: {
        ...req.body,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE GRADING
 */
export const deleteGrading = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.gradingResult.delete({
      where: { id },
    });

    res.json({ message: "Grading deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};