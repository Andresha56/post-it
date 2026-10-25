const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        sub: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        zernioProfileId: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;