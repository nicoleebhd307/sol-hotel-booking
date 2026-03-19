const Service = require('../models/Service');

async function listServices(req, res, next) {
  try {
    const items = await Service.find({}).sort({ createdAt: 1, title: 1 }).lean();
    return res.json(items);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listServices
};
