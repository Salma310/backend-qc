const axios = require("axios");

exports.sendRealtimeAlert = async (payload) => {
  try {
    await axios.post(
      "http://localhost:5678/webhook/qc-alert",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("✅ Sent to n8n");
  } catch (err) {
    console.error(
      "❌ Failed send to n8n:",
      err.response?.data || err.message
    );
  }
};
