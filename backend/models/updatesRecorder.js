const mongoose = require('mongoose');

// new field Schema
const updatesRecorder = new mongoose.Schema({
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changes: {
        type: Object,
        required: true
    },
    message: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const UpdatesRecorder = mongoose.model('UpdatesRecorder', updatesRecorder);

module.exports = UpdatesRecorder;