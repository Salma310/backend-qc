const Land = require("../models/Land");

exports.createLand = async (req, res) => {
  try {
    const land = await Land.create(req.body);
    res.status(201).json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllLands = async (req, res) => {
  try {
    const lands = await Land.find().populate("farmer_id");
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate("farmer_id");
    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }
    res.json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLand = async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLand = async (req, res) => {
  try {
    await Land.findByIdAndDelete(req.params.id);
    res.json({ message: "Land deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
