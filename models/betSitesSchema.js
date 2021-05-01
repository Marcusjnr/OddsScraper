const mongoose = require('mongoose');

const betSitesSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },
    data: {
        required: true,
        type: Object,
        trim: true,
        default: ''
    },
    dateScraped: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model('scrapedData', betSitesSchema);