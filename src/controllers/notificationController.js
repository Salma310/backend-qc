// controllers/notificationController.js
const Notification = require("../models/Notification");

exports.logNotification = async (req, res) => {
  try {
    const notif = await Notification.create({
      lot_id: req.body.lot_id,
      grading_id: req.body.grading_id,
      channel: req.body.channel,
      message: req.body.message,
      status: req.body.status,
      sent_at: new Date()
    });

    res.json({
      message: "Notification logged",
      data: notif
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  const data = await Notification.find()
    .sort({ createdAt: -1 })
    .populate("lot_id")
    .populate("grading_id");

  res.json(data);
};
