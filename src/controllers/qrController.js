const QRCode = require("../models/QRCode");

exports.getByQRCode = async (req, res) => {
  try {
    const qr = await QRCode.findOne({ qr_code: req.params.qr_code })
      .populate("grading_result")
      .populate("farmer land");

    if (!qr) {
      return res.status(404).json({ message: "QR not found" });
    }

    res.json(qr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
