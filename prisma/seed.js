import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

// =========================
// UTIL
// =========================
function randomGrade() {
  const grades = ["A", "B", "C"];
  return grades[Math.floor(Math.random() * grades.length)];
}

function gradeToScore(g) {
  return g === "A" ? 3 : g === "B" ? 2 : 1;
}

// =========================
// GRADING GENERATOR
// =========================
async function createGrading(batch, index, user) {
  const front = randomGrade();
  const back = randomGrade();

  const score = (gradeToScore(front) + gradeToScore(back)) / 2;

  let finalGrade = "C";
  if (score >= 2.5) finalGrade = "A";
  else if (score >= 1.5) finalGrade = "B";

  const confFront = Math.random() * 0.4 + 0.6;
  const confBack = Math.random() * 0.4 + 0.6;

  const confidence_avg = (confFront + confBack) / 2;

  await prisma.gradingResult.create({
    data: {
      batch_id: batch.id,
      grading_code: `GRD-${batch.lot_code}-${index}`,

      grade: finalGrade,
      grading_method: "AI",

      confidence_avg,
      total_detected: 1,
      consistency: front === back ? "HIGH" : "LOW",

      ai_result: [
        { side: "front", grade: front, confidence: confFront },
        { side: "back", grade: back, confidence: confBack },
      ],

      defect_detected: front === "C" || back === "C",

      image_urls: [
        "/uploads/sample_front.jpg",
        "/uploads/sample_back.jpg",
      ],
      graded_by_id: user.id,
    },
  });

  const updateData = {
    total_fruits: { increment: 1 },
  };

  if (finalGrade === "A") updateData.total_grade_a = { increment: 1 };
  if (finalGrade === "B") updateData.total_grade_b = { increment: 1 };
  if (finalGrade === "C") updateData.total_grade_c = { increment: 1 };

  await prisma.batch.update({
    where: { id: batch.id },
    data: updateData,
  });
}

// =========================
// MAIN
// =========================
async function main() {
  console.log("🌱 Seeding FINAL data...");

  const user = await prisma.user.upsert({
  where: { email: 'admin@mail.com' },
  update: {},
  create: {
    name: 'Admin QC',
    email: 'admin@mail.com',
    password_hash: 'hashedpassword',
    role: 'ADMIN',
  },
});

  const farmerNames = [
    "Budi Santoso",
    "Slamet Riyadi",
    "Agus Setiawan",
    "Sutrisno",
  ];

  const farmers = [];

  for (let i = 0; i < farmerNames.length; i++) {
    const farmer = await prisma.farmer.create({
      data: {
        farmer_code: `FRM00${i + 1}`,
        name: farmerNames[i],
        village: "Talun",
        district: "Talun",
        city: "Blitar",
      },
    });
    farmers.push(farmer);
  }

  const lands = [];

  for (let i = 0; i < 9; i++) {
    const land = await prisma.land.create({
      data: {
        farmer_id: farmers[i % 4].id,
        land_code: `LND00${i + 1}`,
        land_name: `Lahan ${i + 1}`,
        location: `Blok ${i + 1}`,
        area_size: 1 + i * 0.3,
        fruit_type: "Jambu Kristal",
      },
    });

    lands.push(land);
  }

  // CLOSED BATCH (4)
  for (let i = 0; i < 4; i++) {
    const batch = await prisma.batch.create({
      data: {
        lot_code: `LOT-CLOSED-${i + 1}`,
        farmer_id: farmers[i].id,
        land_id: lands[i].id,
        status: "CLOSED",
        created_by_id: user.id,
        closed_at: new Date(),
      },
    });

    const total = Math.floor(Math.random() * 11) + 5;

    for (let j = 0; j < total; j++) {
      await createGrading(batch, j, user);
    }
  }

  // OPEN (6 grading)
  const batchOpen1 = await prisma.batch.create({
    data: {
      lot_code: "LOT-OPEN-1",
      farmer_id: farmers[0].id,
      land_id: lands[4].id,
      status: "OPEN",
      created_by_id: user.id,
    },
  });

  for (let i = 0; i < 6; i++) {
    await createGrading(batchOpen1, i, user);
  }

  // OPEN kosong
  await prisma.batch.create({
    data: {
      lot_code: "LOT-OPEN-2",
      farmer_id: farmers[1].id,
      land_id: lands[5].id,
      status: "OPEN",
      created_by_id: user.id,
    },
  });

  console.log("✅ Seeder selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
