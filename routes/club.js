import express from "express";
const router = express.Router();
import { registerController, loginConroller } from "../controllers/club.js";
import { runvalidation } from "../validators/index.js"
import { check } from "express-validator";

const registervalidator = [
    check('username').isLength({ min: 3 }).withMessage('Userame of more than 3 characters is required '),
    check('phonenumber').isLength({ min: 10, max: 10 }).withMessage('Must be a valid Phone Number'),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check("password", "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) and must be 8 characters or longer.").matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
]

const loginvalidator = [ check('email').isEmail().withMessage('Must be a valid email address') ]

router.post('/register', registervalidator, runvalidation, registerController);
router.post('/login',loginvalidator, runvalidation, loginConroller);


export default router