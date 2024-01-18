import Category from '../models/category.js';
import slugify from "slugify";
import Blog from "../models/blog.js";

export const create = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = slugify(name).toLowerCase();
        const category = new Category({ name, description, slug });
        const data = await category.save();
        res.json(data);
    } catch (err) { res.status(400).json({ error: "Something went wrong" }) }
};

export const list = async (req, res) => {
    try {
        const data = await Category.find({}).exec();
        res.json(data);
    } catch (err) { res.status(400).json({ error: "Something went wrong" }) }
};

export const read = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const category = await Category.findOne({ slug }).exec();
        const blogs = await Blog.find({ categories: category })
            .populate('categories', '_id name slug').populate('postedBy', '_id name username')
            .select('_id photo title slug excerpt categories date postedBy tags').exec();
            res.json({ category, blogs });
    } catch (err) { res.status(400).json({ error: "Something went wrong" }) }
};

export const remove = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        await Category.findOneAndRemove({ slug }).exec();
        res.json({ message: 'Category deleted successfully' })
    }
    catch (err) { res.status(400).json({ error: "Something went wrong" }) }
};