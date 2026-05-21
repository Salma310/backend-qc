// scripts/clearData.js
import 'dotenv/config'
import pkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const { PrismaClient } = pkg

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
})

async function clearData() {
  console.log('🗑️  Mulai hapus data...\n')

  try {

    
    const logs = await prisma.bundleQRAccessLog.deleteMany()
    console.log(`✅ BundleQRAccessLog: ${logs.count} dihapus`)

    const notifs = await prisma.notification.deleteMany()
    console.log(`✅ Notification: ${notifs.count} dihapus`)

    const gradings = await prisma.gradingResult.deleteMany()
    console.log(`✅ GradingResult: ${gradings.count} dihapus`)

    const bundles = await prisma.batchGradeBundle.deleteMany()
    console.log(`✅ BatchGradeBundle: ${bundles.count} dihapus`)

    const batches = await prisma.batch.deleteMany()
    console.log(`✅ Batch: ${batches.count} dihapus`)

    const lands = await prisma.land.deleteMany()
    console.log(`✅ Land: ${lands.count} dihapus`)

    const farmers = await prisma.farmer.deleteMany()
    console.log(`✅ Farmer: ${farmers.count} dihapus`)

    console.log('\n✨ Selesai! Data User tetap aman.')
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

clearData()