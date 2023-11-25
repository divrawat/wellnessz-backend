import mongoose from "mongoose";

const LinksSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        description: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        postedBy: {type: ObjectId, ref: 'ClubUser' }    
    },
    
);

export default mongoose.model('Links', LinksSchema);