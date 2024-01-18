import Admin from "../models/admin.js";
import ClubUser from "../models/club.js";
import Interested from "../models/interested.js"
import jwt from "jsonwebtoken";
import _ from "lodash";
import { expressjwt } from "express-jwt";
import "dotenv/config.js";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const signup = async (req, res) => {
    try {
        const emailExists = await Admin.findOne({ email: req.body.email });
        if (emailExists) { return res.status(400).json({ error: 'Email is taken' }); }

        const usernameExists = await Admin.findOne({ username: req.body.username });
        if (usernameExists) { return res.status(400).json({ error: 'Username is taken' }); }

        const { name, username, email, password, role } = req.body;

        const newUser = new Admin({ name, username, email, password, role });
        await newUser.save();

        res.json({ message: 'Admin has been created' });
    } catch (err) { return res.status(400).json({ error: err.message }); }
};




export const signin = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await Admin.findOne({ email: req.body.email }).exec();

        if (!user) { return res.status(400).json({ error: 'User with that email does not exist. Please signup.' }); }
        if (!user.authenticate(password)) { return res.status(400).json({ error: 'Email and password do not match.' }); }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.cookie('token', token, { expiresIn: 1 * 24 * 60 * 60 * 1000 });
        const { _id, username, name, email, role } = user;

        return res.json({ token, user: { _id, username, name, email, role } });
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
};



export const listalladmins = async (req, res) => {
    try {
        const totalCount = await Admin.countDocuments({}).exec();
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const skip = (page - 1) * perPage;
        const data = await Admin.find({}).sort({ createdAt: -1 }).select('_id name username email role').skip(skip).limit(perPage).exec();
        res.json({ totalAdmins: totalCount, data });
    } catch (err) { console.error('Error fetching Admins:', err); res.status(500).json({ error: 'Internal Server Error' }); }
};



export const remove = async (req, res) => {
    try {
        const { username } = req.query;
        if (username) {
            const deletedUSer = await Admin.findOneAndDelete({ username }).exec();
            if (deletedUSer) {
                res.json({ message: 'Admin deleted successfully' });
            } else { res.status(404).json({ error: 'Admin Cannot be found or deleted' }); }
        }
    } catch (err) { console.error(err); res.status(500).json({ error: 'Cannot delete Admin' }); }
};


export const read = async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const data = await Admin.findOne({ username })
            .select('_id name username email role');
        if (!data) { return res.status(404).json({ error: 'Admin not found' }) }
        res.json(data);
    } catch (error) { res.status(404).json({ error: 'Admin not found' }) }
};




export const update = async (req, res) => {
    try {
        const username = req.params.username;
        const updatedFields = req.body;
        console.log(req.body);

        const user = await Admin.findOne({ username });
        if (!user) { return res.status(400).json({ error: 'User not found' }); }

        const { password } = req.body;
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
            return res.status(400).json({
                error: 'Password should contain at least 1 lowercase, 1 uppercase, 1 numeric, 1 special character, and must be 8 characters or longer.',
            });
        }

        Object.assign(user, updatedFields);
        await user.save();

        res.json({ message: 'Admin updated successfully' });
    } catch (err) { res.status(400).json({ error: console.log(err) }); }
};



export const signout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Signout success' });
};


export const requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth",
});



export const adminMiddleware = async (req, res, next) => {
    try {
        const adminUserId = req.auth._id;
        const user = await Admin.findById(adminUserId).exec();
        if (!user) { return res.status(400).json({ error: 'User not found' }); }
        if (user.role !== 1) { return res.status(400).json({ error: 'Admin resource. Access denied' }); }
        req.profile = user;
        
        next();
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
};


export const clubclientmiddleware = async (req, res, next) => {
    try {
        const clientUserId = req.auth._id;
        const user = await ClubUser.findById(clientUserId).exec();
        if (!user) { return res.status(400).json({ error: 'ClubUser not found' }); }
        if (user.role !== 3) { return res.status(400).json({ error: 'ClubResource resource. Access denied' }); }
        req.profile = user;
        next();
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
};


export const superadminMiddleware = async (req, res, next) => {
    try {
        const adminUserId = req.auth._id;
        const user = await Admin.findById(adminUserId).exec();
        if (!user) { return res.status(400).json({ error: 'User not found' }); }
        if (user.username !== 'simar18') { return res.status(400).json({ error: 'Super Admin resource. Access denied' }); }
        req.profile = user;
        next();
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
};



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Admin.findOne({ email });

        if (!user) { return res.status(401).json({ error: 'User with that email does not exist' }); }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password reset link`,
            html: `
                <p>Please use the following link to reset your password:</p>
                <p>${process.env.MAIN_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>https://wellnessz.in</p>
            `
        };

        await user.updateOne({ resetPasswordLink: token });
        await sgMail.send(emailData);
        return res.json({ message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.` });
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
};


export const resetPassword = async (req, res) => {
    try {
        const { resetPasswordLink, newPassword } = req.body;

        if (resetPasswordLink) {
            const decoded = jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD);

            if (decoded) {
                const user = await Admin.findOne({ resetPasswordLink });

                if (!user) { return res.status(401).json({ error: 'Something went wrong. Try later' }); }
                const updatedFields = { password: newPassword, resetPasswordLink: '' };
                _.extend(user, updatedFields);

                await user.save();

                return res.json({ message: `Great! Now you can login with your new password` });
            }
        }

        return res.status(401).json({ error: 'Expired link. Try again' });
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }

};



// --------------------------------------- --------------------------------------------------
