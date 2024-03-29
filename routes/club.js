import express from "express";
const router = express.Router();
import { registerController, loginConroller, listallclubusers,createClubeUser, remove, read, update, addclient, allusernames, checkusername, removeInterestedCoach, InterestedRegister, listallInterestedCoach } from "../controllers/club.js";
import { superadminMiddleware, adminMiddleware, requireSignin, clubclientmiddleware } from "../controllers/auth.js";
import { runvalidation } from "../validators/index.js";
import { check } from "express-validator";
import admin from "../models/admin.js";

const registervalidator = [
    check('name').isLength({ min: 3 }).withMessage('Name of more than 3 characters is required '),
    check('username').isLength({ min: 3 }).withMessage('Username of more than 3 characters is required')
        .custom((value) => { if (!/^[a-z0-9]+$/.test(value)) { throw new Error('Username can only contain lowercase letters and numbers'); } return true; }),
    check('phonenumber').isLength({ min: 10, max: 10 }).withMessage('Must be a valid Phone Number'),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check("password", "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) with 8 characters long").matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
]

const loginvalidator = [check('email').isEmail().withMessage('Must be a valid email address')]

router.post('/interested-register', loginvalidator, runvalidation, InterestedRegister);

router.post('/register', registervalidator, runvalidation, requireSignin, adminMiddleware, registerController);
router.post('/login', loginvalidator, runvalidation, loginConroller);




router.get('/allclubusers', listallclubusers);

router.get('/allinterestedcoaches', requireSignin, adminMiddleware, listallInterestedCoach);

router.get('/users/:username', read);
router.get('/usernames', allusernames);

router.delete('/users/:username', requireSignin, superadminMiddleware, remove);
router.delete('/interestedcoach/:username', requireSignin, adminMiddleware, removeInterestedCoach);


router.patch('/user/update/:username', requireSignin, superadminMiddleware, update);

router.post('/client/addclient', requireSignin, clubclientmiddleware, addclient);

router.get('/username-exists', checkusername)

router.post('/createclubuser', createClubeUser);

export default router