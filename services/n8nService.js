// services/n8nService.js
const axios = require("axios");

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/qc-alert";

exports.sendRealtimeAlert = async (gradingData) => {
  try {
    await axios.post(N8N_WEBHOOK_URL, {
      lot_id: gradingData.lot_id,
      grade: gradingData.grade,
      expiry_prediction: gradingData.expiry_prediction,
      defect_detected: gradingData.defect_detected,
      confidence: gradingData.confidence,
      created_at: gradingData.createdAt
    });
  } catch (err) {
    console.error("❌ Failed send to n8n:", err.message);
  }
};

// const axios = require("axios");

// exports.sendRealtimeAlert = async (payload) => {
//   try {
//     await axios.post(
//       "http://localhost:5678/webhook/qc-alert",
//       payload,
//       { headers: { "Content-Type": "application/json" } }
//     );
//     console.log("✅ Sent to n8n");
//   } catch (err) {
//     console.error(
//       "❌ Failed send to n8n:",
//       err.response?.data || err.message
//     );
//   }
// };
