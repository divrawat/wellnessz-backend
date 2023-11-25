import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
    {
        name: {
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
        joiningdate: {
            type: Date,
            index: true,
        },

        phonenumber: {
            type: String,
        },
        sponsoredby: {
            type: String,
        }
    },
);

export default mongoose.model('ClientClients', ClientSchema);