let mongoose = require('mongoose');
mongoose.set('useFindAndModify', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);

const ClientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    profileUrl: {
        type: String,
    },

    NameAttendance: {
        type: String,
        default: ""
    },

    chatId: {
        type: String,
        required: true
    },

    inAttendace: {
        type: Boolean,
        default: false
    },

    inGrant: {
        type: Boolean,
        default: false
    },

    firstAttendace: {
        type: Boolean,
        default: true
    },

    WorkerAttendance: {
        type: String,
        default: "no-one"
    },

    Sector: {
      type: String, 
      default: "all"  
    },

    WithDrawCash: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = ClientSchema;