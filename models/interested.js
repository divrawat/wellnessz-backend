import mongoose from "mongoose";

const Interested = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            index: true,
            trim: true,
        },
        city: {
            type: String,
            index: true,
        },

        phonenumber: {
            type: String,
        },

    }, { timestamps: true },
);

export default mongoose.model('Interested', Interested);