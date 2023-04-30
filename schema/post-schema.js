const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    userPhoto: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true,
        default: "Anonymous User",
    },
    postImg: {
        type: String,
        required: true
    },
    postContent: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const postModel = model("post", postSchema) // creating collection 

module.exports = postModel;