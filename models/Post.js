const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
    },
    designation:{
        type: String,
        required: false,
        default:'unknown'
    },
    postImg:{
        type: String,
    }
}, {timestamps: true});

module.exports =  mongoose.model("Post",PostSchema);