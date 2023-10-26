import User from "../models/user.js";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { expressjwt } from "express-jwt";
import "dotenv/config.js";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const signup = async (req, res) => {
    try {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) { return res.status(400).json({error: 'Email is taken'});    }

        const usernameExists = await User.findOne({ username: req.body.username });
        if (usernameExists) {  return res.status(400).json({error: 'Username is taken'});}
           
        const { name, username, email, password } = req.body;
        let usernameurl = username.toLowerCase();
        let profile = `${process.env.CLIENT_URL}/profile/${usernameurl}`;

        const newUser = new User({ name, username, email, password, profile });
        await newUser.save();

        res.json({message: 'Signup success! Please signin.'});
    } catch (err) {return res.status(400).json({error: err.message});}  
};



export const signin = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({ email: req.body.email }).exec();

        if (!user) { return res.status(400).json({ error: 'User with that email does not exist. Please signup.'}); }
        if (!user.authenticate(password)) { return res.status(400).json({ error: 'Email and password do not match.'});}
           
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.cookie('token', token, { expiresIn: 1 * 24 * 60 * 60 * 1000 });
        const { _id, username, name, email, role } = user;

        return res.json({token, user: { _id, username, name, email, role }});
    } catch (error) {return res.status(500).json({error: 'Internal server error'});  }   
};



export const signout = (req, res) => {
    res.clearCookie('token');
    res.json({message: 'Signout success'});  
};


export const requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth",
});



export const adminMiddleware = async (req, res, next) => {
    try {
        const adminUserId = req.auth._id;
        const user = await User.findById(adminUserId).exec();
        if (!user) {return res.status(400).json({error: 'User not found'});}
        if (user.role !== 1) {return res.status(400).json({error: 'Admin resource. Access denied'}); }
        req.profile = user;
        next();
    } catch (error) { return res.status(500).json({error: 'Internal server error'}); } 
};


export const superadminMiddleware = async (req, res, next) => {
    try {
        const adminUserId = req.auth._id;
        const user = await User.findById(adminUserId).exec();
        if (!user) {return res.status(400).json({error: 'User not found'});}
        if (user.username !== 'divrawat') {return res.status(400).json({error: 'Super Admin resource. Access denied'}); }
        req.profile = user;
        next();
    } catch (error) { return res.status(500).json({error: 'Internal server error'}); } 
};



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {return res.status(401).json({error: 'User with that email does not exist'}); }
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
        return res.json({message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.`  });
    } catch (error) {return res.status(500).json({error: 'Internal server error'});}   
};


export const resetPassword = async (req, res) => {
    try {
        const { resetPasswordLink, newPassword } = req.body;

        if (resetPasswordLink) {
            const decoded = jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD);

            if (decoded) {
                const user = await User.findOne({ resetPasswordLink });

                if (!user) {return res.status(401).json({error: 'Something went wrong. Try later'});   }
                const updatedFields = {password: newPassword,resetPasswordLink: '' };
                _.extend(user, updatedFields);

                await user.save();

                return res.json({ message: `Great! Now you can login with your new password` });
            }
        }

        return res.status(401).json({ error: 'Expired link. Try again'});    
    } catch (error) {return res.status(500).json({ error: 'Internal server error'}); }
  
};



// --------------------------------------- --------------------------------------------------
