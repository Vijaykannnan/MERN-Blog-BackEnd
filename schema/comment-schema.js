const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const commentSchema = new Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    message: {
        type: String,
        require: true,
        max: 100
    },
    postCommentId: {
        type: String
    }
},
    { timestamps: true }
)

let commentModel = model("comment", commentSchema)
module.exports = commentModel