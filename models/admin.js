import mongoose from "mongoose";
import crypto from "crypto";

const AdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        username: {
            type: String,
            trim: true,
            required: true,
            max: 32,
            lowercase: true,
            unique: true
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true,
            index:true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        about: {
            type: String
        },
        role: {
            type: Number,
            default: 1
        },
        resetPasswordLink: {
            data: String,
            default: ''
        }
    },
);

AdminSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

    AdminSchema.methods = {
    authenticate: function (plainText) { return this.encryptPassword(plainText) === this.hashed_password; },
    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        } catch (err) {
            return '';
        }
    },
    makeSalt: function () { return Math.round(new Date().valueOf() * Math.random()) + ''; }
};

export default mongoose.model('Admin', AdminSchema);

