const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    createdBy:      { type: String, required: true },
    userId:         { type: Number, required: true, unique: [true, 'Already Exists'] },
    username:       { type: String, required: true },
    discriminator:  { type: String, required: true },
    joined:         { type: Date,   default: Date.now },
    role:           { type: String, default: 'Não definido'},
    profession:     { type: String, default: 'Não definido'},
    comments:       { type: String },
    lastUpdated:    { type: Date,   required: false },
    lastUpdatedBy:  { type: String, required: false }
});

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;