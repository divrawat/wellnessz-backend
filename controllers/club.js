import ClubUser from "../models/club.js"
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
    try {
        const { username, email, phonenumber, password, city } = req.body;

        if (!username || !email || !phonenumber || !password || !city) {
            return res.status(400).send({message: "Please fill all details"})   
        } 

        const emailExists = await ClubUser.findOne({ email });
        if (emailExists) { return res.status(400).json({error: 'Email is taken'});    }

        const usernameExists = await ClubUser.findOne({ username });
        if (usernameExists) {  return res.status(400).json({error: 'Username is taken'});}

        const newUser = new ClubUser({ username, phonenumber, email, password, city });
        await newUser.save();

        res.json({message: 'New ClubUSer successfully created'});
    } catch (err) {return res.status(400).json({error: err.message});}  
};



export const loginConroller = async (req, res) => {
    try {
        
        const user = await ClubUser.findOne({ email: req.body.email }).exec();

        if (!user) { return res.status(400).json({ error: 'User with that email does not exist. Please signup.'}); }
        if (!user.authenticate(req.body.password)) { return res.status(400).json({ error: 'Email and password do not match.'});}
           
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.cookie('token', token, { expiresIn: 1 * 24 * 60 * 60 * 1000 });
        const { username, city, phonenumber, email } = user;

        return res.json({token, user: { username, phonenumber, email, city }});
    } catch (error) {return res.status(500).json({error: 'Internal server error'});  }   
};





/*

async function sendMail(eMail) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });
    const info = transporter.sendMail({
        from: '"wellnessZ" <amitkumar790194@gmail.com>',
        to: eMail,
        text: "Thankyou for Registration",
        html: "<b>you successfully registered</b>"

    })
}

*/