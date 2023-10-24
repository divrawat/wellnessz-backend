import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        body: {
            type: {},
            required: true,
            min: 200,
            max: 2000000
        },
        excerpt: {
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },
        date: {
            type: Date,
            required: true,
        },
        photo: {
            type: String
        },
        categories: [{ type: ObjectId, ref: 'Category', required: true }],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
);

export default mongoose.model('Blog', blogSchema);