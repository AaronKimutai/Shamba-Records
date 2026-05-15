const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    cropType: {
        type: String,
        required: true
    },
    plantingDate: {
        type: Date,
        required: true
    },
    currentStage: {
        type: String,
        enum: ['planted', 'growing', 'ready', 'harvested'],
        set: (value) => value? value.toLowerCase(): value,
        required: true
    },
    fieldAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String
    },
    fieldStatus: {
        type: String,
        enum: ['active', 'atrisk', 'completed'],
        set: (value) => value? value.toLowerCase(): value,
        default: null
    }
});

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;




