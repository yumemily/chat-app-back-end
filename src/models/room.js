const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: String,
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        sparse: true
    }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }

})

const Room = mongoose.model("Room", schema)
module.exports = Room