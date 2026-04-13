// controllers/publicController.js
const QRCode = require("../models/QRCode");

exports.getPublicQR = async (req, res) => {
  const qr = await QRCode.findOne({ qr_token: req.params.token })
    .populate({
      path: "lot_id",
      populate: ["farmer_id", "land_id"]
    })
    .populate("grading_id");

  if (!qr) return res.status(404).send("QR not found");

  res.json({
    fruit_type: qr.lot_id.fruit_type,
    farmer: qr.lot_id.farmer_id.name,
    land: qr.lot_id.land_id.land_name,
    harvest_date: qr.lot_id.harvest_date,
    grade: qr.grading_id.grade,
    expiry_prediction: qr.grading_id.expiry_prediction
  });
};
