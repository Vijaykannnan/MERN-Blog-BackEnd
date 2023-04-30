const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const registerSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },

    email: {
        type: String,
        required: 'Email address is required',
        unique: false
    },
    password: {
        type: String,
        required: true
    },

},
    { timestamps: true }
);

const registerModel = model("register", registerSchema) // creating collection 

module.exports = registerModel;