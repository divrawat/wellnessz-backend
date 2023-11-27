import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

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
            type: String,
            index: true,
        },
        url:{
            type: String,
        },

        phonenumber: {
            type: String,
        },
        sponsoredby: {
            type: String,
        },
        postedBy: {type: ObjectId, ref: 'ClientClients'}
    },
);

export default mongoose.model('ClientClients', ClientSchema);