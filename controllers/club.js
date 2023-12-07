import ClubUser from "../models/club.js";
import jwt from "jsonwebtoken";
import ClientClients from "../models/clientclients.js";

export const registerController = async (req, res) => {
    try {
        const { name, username, email, phonenumber, password, city } = req.body;

        if (!username || !email || !phonenumber || !password || !city) {
            return res.status(400).send({ message: "Please fill all details" })
        }

        const emailExists = await ClubUser.findOne({ email });
        if (emailExists) { return res.status(400).json({ error: 'Email is taken' }); }

        const usernameExists = await ClubUser.findOne({ username });
        if (usernameExists) { return res.status(400).json({ error: 'Username is taken' }); }

        const newUser = new ClubUser({ name, username, phonenumber, email, password, city });
        await newUser.save();

        res.json({ message: 'New ClubUSer successfully created' });
    } catch (err) { return res.status(400).json({ error: err.message }); }
};



export const loginConroller = async (req, res) => {
    try {

        const user = await ClubUser.findOne({ email: req.body.email }).exec();

        if (!user) { return res.status(400).json({ error: 'User with that email does not exist. Please signup.' }); }
        if (!user.authenticate(req.body.password)) { return res.status(400).json({ error: 'Email and password do not match.' }); }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.cookie('token', token, { expiresIn: 1 * 24 * 60 * 60 * 1000 });
        const { username, city, phonenumber, email } = user;

        return res.json({ token, user: { username, phonenumber, email, city } });
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
};


export const listallclubusers = async (req, res) => {
    try {
        const totalCount = await ClubUser.countDocuments({}).exec();
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const skip = (page - 1) * perPage;
        const data = await ClubUser.find({}).sort({ createdAt: -1 }).select('_id name username email phonenumber city createdAt').skip(skip).limit(perPage).exec();
        res.json({ totalclubUsers: totalCount, data });
    } catch (err) { console.error('Error fetching images:', err); res.status(500).json({ error: 'Internal Server Error' }); }
};


export const remove = async (req, res) => {
    try {
        const { username } = req.query;
        if (username) {
            const deletedUSer = await ClubUser.findOneAndDelete({ username }).exec();
            if (deletedUSer) {
                res.json({ message: 'ClubUser deleted successfully' });
            } else { res.status(404).json({ error: 'ClubUser Cannot be found or deleted' }); }
        }
    } catch (err) { console.error(err); res.status(500).json({ error: 'Cannot delete User' }); }
};




export const read = async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const data = await ClubUser.findOne({ username })
            .select('_id name username email phonenumber city');
        if (!data) { return res.status(404).json({ error: 'ClubUser not found' }) }
        res.json(data);
    } catch (error) { res.status(404).json({ error: 'ClubUser not found' }) }
};


export const update = async (req, res) => {
    try {
        const username = req.params.username;
        const updatedFields = req.body;

        const user = await ClubUser.findOne({ username });
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

        res.json({ message: 'Club User updated successfully' });
    } catch (err) { res.status(400).json({ error: console.log(err) }); }
};



export const addclient = async (req, res) => {
    try {

        const { name, joiningdate, email, phonenumber, url, city, sponsoredby } = req.body;

        const emailExists = await ClientClients.findOne({ email });
        if (emailExists) { return res.status(400).json({ error: 'Email is taken' }); }

        const newClient = new ClientClients({ name, joiningdate, url, phonenumber, email, city, sponsoredby });
        await newClient.save();

        res.json({ message: 'Client has been Added' });

    } catch (err) { return res.status(400).json({ error: err.message }); }
}


export const allusernames = async (req, res) => {
    try {
        const data = await ClubUser.find({}).select('_id username').exec();
        res.json(data);
    } catch (err) { console.error('Error fetching Usernames:', err); res.status(500).json({ error: 'Internal Server Error' }); }
};




export const checkusername = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter missing' });
    }

    try {
        const user = await ClubUser.find({username}).exec();
        if (user) {
            return res.json({ exists: true });
          } else {
            return res.json({ exists: false });
          }
    } catch (err) { console.error('Username does not exists:', err); res.status(500).json({ error: 'Internal Server Error' }); }



};


