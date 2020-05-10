const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name : {
        type: String,
        unique: true,
        lowerCase: true,
        trim: true
    },
    room: { //telling us that this user is subscribing to a certain room
        type: mongoose.Schema.ObjectId,
        ref: "Room",
    },
    token: String
    
})

module.exports = mongoose.model("User", schema)