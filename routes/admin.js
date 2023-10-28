import express from "express";
const router = express.Router();
import { signup, signin, signout, forgotPassword,resetPassword, listalladmins, remove, update, read, requireSignin, superadminMiddleware } from "../controllers/auth.js"
import { runvalidation } from "../validators/index.js"
import { check } from "express-validator";    
  
// const adminsignupvalidators = [
//     check('name').isLength({ min: 5 }).withMessage('Name of more than 5 characters is required '),
//     check('username').isLength({ min: 3, max: 15 }).withMessage('Username of more than 3 and less than 15 characters is required '),
//     check('email').isEmail().withMessage('Must be a valid email address'),
//     check("password", "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) with more than 8 characters").matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
// ]


const adminsignupvalidator = [
    check('name').isLength({ min: 3 }).withMessage('Name of more than 3 characters is required '),
    check('username').isLength({ min: 3 }).withMessage('Username of more than 3 characters is required')
    .custom((value) => {if (!/^[a-z0-9]+$/.test(value)) {throw new Error('Username can only contain lowercase letters and numbers'); } return true;}),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check("password", "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) with 8 characters long").matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
]

const resetPasswordValidator = [
    check("newPassword", "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) with more than 8 characters").matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
]


const adminsigninvalidator = [ check('email').isEmail().withMessage('Must be a valid email address') ]
const forgotPasswordValidator = [ check('email').not().isEmpty().isEmail().withMessage('Must be a valid email address')  ];


router.post('/signup', adminsignupvalidator, runvalidation,requireSignin, superadminMiddleware, signup)
router.post('/signin', adminsigninvalidator, runvalidation, signin)
router.get('/signout', signout);


router.get('/alladmins', listalladmins);
router.get('/admin/:username', read);
router.delete('/admin/:username',requireSignin, superadminMiddleware, remove);
router.patch('/admin/update/:username', requireSignin, superadminMiddleware, update);



router.put('/forgot-password', forgotPasswordValidator, runvalidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runvalidation, resetPassword);

export default router