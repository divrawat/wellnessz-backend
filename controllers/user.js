import User from "../models/user.js";
import Blog from "../models/blog.js";
import fs from "fs";
import formidable from "formidable";
import _ from "lodash";

export const read = (req, res) => {
    req.profile.hashed_password = undefined;
    return res.json(req.profile);
};

export const publicProfile = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).exec();
        if (!user) {return res.status(400).json({error: 'User not found' })}
        
        const userId = user._id;
        const data = await Blog.find({ postedBy: userId })
            .limit(10)
            .populate('categories', '_id name slug').populate('postedBy', '_id name')
            .select('_id title slug excerpt categories postedBy createdAt updatedAt').exec();
            
        user.photo = undefined;
        user.hashed_password = undefined;
        res.json({ user, blogs: data, });
    } catch (error) { res.status(400).json({ "Error": "Something Went Wrong" }) }
};


export const update = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtension = true;

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {throw new Error('Photo could not be uploaded')}
                
            let user = req.profile;

            // user's existing role and email before update
            const { role: existingRole, email: existingEmail } = user;

            user = _.merge(user, fields);
            user.role = existingRole;
            user.email = existingEmail;

            const { password } = fields;

            function validatePassword(password) {
                const lowercaseRegex = /[a-z]/;
                const uppercaseRegex = /[A-Z]/;
                const numericRegex = /[0-9]/;
                const specialCharRegex = /[!@#$%^&*]/;
                return (
                    password.length >= 8 &&
                    lowercaseRegex.test(password) &&
                    uppercaseRegex.test(password) &&
                    numericRegex.test(password) &&
                    specialCharRegex.test(password)
                );
            }

            if (password && !validatePassword(password)) {
                throw new Error('Password should contain at least 1 lowercase, 1 uppercase, 1 numeric, 1 special character and must be 8 characters or longer.'    
                );
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {throw new Error('Image should be less than 1mb')}
                user.photo.data = fs.readFileSync(files.photo.filepath);
                user.photo.contentType = files.photo.type;
            }
            const result = await user.save();
            result.hashed_password = undefined;
            result.salt = undefined;
            result.photo = undefined;
            res.json(result);
        } catch (error) {
            res.status(400).json({error: error.message})}
    });
};




export const photo = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).exec();
        if (!user) { return res.status(400).json({ error: 'User not found' }) }
        if (user.photo.data) { res.set('Content-Type', user.photo.contentType); return res.send(user.photo.data) }
    } catch (error) { res.status(400).json({ "Error": "Something Went Wrong" }) }
};