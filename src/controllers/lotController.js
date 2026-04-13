// controllers/lotController.js
const Lot = require("../models/Lot");

exports.createLot = async (req, res) => {
  const lot = await Lot.create(req.body);
  res.json(lot);
};

exports.getLots = async (req, res) => {
  const lots = await Lot.find()
    .populate("farmer_id")
    .populate("land_id");
  res.json(lots);
};

exports.getLotById = async (req, res) => {
  const lot = await Lot.findById(req.params.id)
    .populate("farmer_id")
    .populate("land_id");
  res.json(lot);
};
