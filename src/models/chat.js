const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    text: {
        type: String,
        trim: true,
        required: true
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: "Room",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
},
    {
        timestamps: true
    });

schema.pre(/^find/, function (next) {
    this
        .populate("user", "name")
        .populate("room", "_id ")
    next();
});

module.exports = mongoose.model("Chat", schema)