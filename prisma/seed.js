require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter, // 🔥 INI YANG WAJIB DI V7 CLIENT MODE
});

async function main() {
  console.log("🌱 Seeding complex data...");

  // ======================
  // USER
  // ======================
  const user = await prisma.user.create({
    data: {
      name: "Admin QC",
      email: "admin@mail.com",
      password_hash: "hashedpassword",
      role: "ADMIN",
    },
  });

  // ======================
  // FARMERS (3)
  // ======================
  const farmers = [];

  for (let i = 1; i <= 3; i++) {
    const farmer = await prisma.farmer.create({
      data: {
        farmer_code: `FRM00${i}`,
        name: `Petani ${i}`,
        phone: `08123${i}000`,
        address: `Desa ${i}`,
        village: `Desa ${i}`,
        district: "Talun",
        city: "Blitar",
      },
    });

    farmers.push(farmer);
  }

  // ======================
  // LANDS (5)
  // ======================
  const lands = [];

  for (let i = 1; i <= 5; i++) {
    const farmer = farmers[i % 3];

    const land = await prisma.land.create({
      data: {
        farmer_id: farmer.id,
        land_code: `LND00${i}`,
        land_name: `Lahan ${i}`,
        location: `Blok ${i}`,
        area_size: 1 + i * 0.5,
        fruit_type: "Jambu Kristal",
      },
    });

    lands.push(land);
  }

  // ======================
  // BATCH (3)
  // ======================
  const batches = [];

  const batchStatuses = ["CLOSED", "CLOSED", "OPEN"];

  for (let i = 0; i < 3; i++) {
    const batch = await prisma.batch.create({
      data: {
        lot_code: `LOT-00${i + 1}`,
        farmer_id: farmers[i].id,
        land_id: lands[i].id,
        fruit_type: "Jambu Kristal",
        harvest_date: new Date(),
        harvest_time: new Date(),
        treatment: "Sortir + cuci",
        created_by_id: user.id,
        status: batchStatuses[i],
        closed_at: batchStatuses[i] === "CLOSED" ? new Date() : null,
      },
    });

    batches.push(batch);
  }

  // ======================
  // GRADING (15 total)
  // ======================
  const grades = ["A", "B", "C"];

  for (const batch of batches) {
    for (let i = 0; i < 5; i++) {
      const grade = grades[Math.floor(Math.random() * grades.length)];

      await prisma.gradingResult.create({
        data: {
          batch_id: batch.id,
          grading_code: `GRD-${batch.lot_code}-${i}`,
          grade: grade,
          confidence: Math.random(),
          defect_detected: Math.random() > 0.7,
          expiry_prediction: 5 + i,

          color_score: Math.random(),
          texture_score: Math.random(),
          defect_score: Math.random(),

          image_urls: [
            "/uploads/sample1.jpg",
            "/uploads/sample2.jpg",
          ],

          qr_token: `QR-${batch.lot_code}-${i}`,
          graded_by_id: user.id,
        },
      });

      // 🔥 update summary
      const updateData = {
        total_fruits: { increment: 1 },
      };

      if (grade === "A") updateData.total_grade_a = { increment: 1 };
      if (grade === "B") updateData.total_grade_b = { increment: 1 };
      if (grade === "C") updateData.total_grade_c = { increment: 1 };

      await prisma.batch.update({
        where: { id: batch.id },
        data: updateData,
      });
    }
  }

  console.log("✅ Seeder selesai!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });