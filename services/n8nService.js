import axios from "axios";
import { prisma } from "../src/lib/prisma.js";

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "http://localhost:5678/webhook/qc-alert";

export const sendBatchClosedNotification = async (batch) => {
  try {
    // ========================
    // Average Confidence
    // ========================

    const confidences =
      batch.gradings
        ?.map((g) => g.confidence)
        ?.filter((c) => c !== null && c !== undefined) || [];

    const avgConfidence =
      confidences.length > 0
        ? Number(
            (
              confidences.reduce((a, b) => a + b, 0) /
              confidences.length
            ).toFixed(2)
          )
        : null;

    // ========================
    // Bundle QR
    // ========================

    const gradeA =
      batch.bundles?.find((b) => b.grade === "A") || null;

    const gradeB =
      batch.bundles?.find((b) => b.grade === "B") || null;

    const gradeC =
      batch.bundles?.find((b) => b.grade === "C") || null;

    const reject =
      batch.bundles?.find((b) => b.grade === "REJECT") || null;

    // ========================
    // Payload to n8n
    // ========================

    const payload = {
      batch_id: batch.id,
      lot_code: batch.lot_code,

      farmer_name: batch.farmer?.name,
      farmer_code: batch.farmer?.farmer_code,

      land_name: batch.land?.land_name,

      fruit_type: batch.fruit_type,

      harvest_date: batch.harvest_date,
      harvest_weight: batch.harvest_weight,

      total_fruits: batch.total_fruits,

      total_grade_a: batch.total_grade_a,
      total_grade_b: batch.total_grade_b,
      total_grade_c: batch.total_grade_c,
      total_reject: batch.total_reject,

      avg_confidence: avgConfidence,

      status: batch.status,
      closed_at: batch.closed_at,

      qr_grade_a: gradeA?.qr_url || null,
      qr_grade_b: gradeB?.qr_url || null,
      qr_grade_c: gradeC?.qr_url || null,
      qr_reject: reject?.qr_url || null,
    };

    console.log("========== N8N PAYLOAD ==========");
    console.log(JSON.stringify(payload, null, 2));
    console.log("Webhook URL:", N8N_WEBHOOK_URL);
    console.log("=================================");

    const response = await axios.post(
      N8N_WEBHOOK_URL,
      payload
    );

    console.log("N8N STATUS:", response.status);

    // ========================
    // Save Notification Log
    // ========================

    await prisma.notification.create({
      data: {
        batch_id: batch.id,
        channel: "TELEGRAM",
        status: "SENT",

        message: JSON.stringify(payload),

        sent_at: new Date(),
      },
    });

    console.log("✅ Batch summary sent to n8n");
  } catch (err) {
    console.error("❌ Failed send batch summary");

    console.error("MESSAGE:");
    console.error(err.message);

    if (err.response) {
      console.error("STATUS:");
      console.error(err.response.status);

      console.error("DATA:");
      console.error(err.response.data);
    }

    if (err.request) {
      console.error("NO RESPONSE FROM N8N");
    }
    
    await prisma.notification.create({
      data: {
        batch_id: batch.id,
        channel: "TELEGRAM",
        status: "FAILED",

        message: `Failed send notification for ${batch.lot_code}`,

        error_msg: err.message,
      },
    });
  }
};