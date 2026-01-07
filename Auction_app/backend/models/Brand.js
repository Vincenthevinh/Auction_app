const mongoose = require('mongoose');
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    logo: String,
    description: String,
    country: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Brand', brandSchema);