"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkAuth_1 = require("../middleware/checkAuth");
const stripe_1 = require("../utils/stripe");
const router = express_1.default.Router();
// Update Password
router.put("/changepass", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newPassword = yield bcryptjs_1.default.hash(req.body.newPassword, 10);
    const email = req.body.email;
    console.log(newPassword);
    console.log(email);
    try {
        yield user_1.default.findOneAndUpdate({ email: email }, { password: newPassword });
    }
    catch (err) {
        console.log(err);
    }
}));
// Sign up
router.post("/signup", (0, express_validator_1.body)("email").isEmail().withMessage("The email is invalid"), (0, express_validator_1.body)("password").isLength({ min: 5 }).withMessage("The password is invalid"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // returns an array of errors
    const validationErrors = (0, express_validator_1.validationResult)(req);
    // check if validationError array is empty, if not return an error msg
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => {
            return {
                msg: error.msg,
            };
        });
        return res.json({ errors, data: null });
    }
    const { email, password } = req.body;
    // returns null if no email found
    const user = yield user_1.default.findOne({ email });
    // if email is already in use, return error msg
    if (user) {
        return res.json({
            errors: [
                {
                    msg: "Email already in use",
                },
            ],
            data: null,
        });
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    // creating stripe customer here
    const customer = yield stripe_1.stripe.customers.create({
        email,
    }, {
        apiKey: process.env.STRIPE_SECRET_KEY,
    });
    const newUser = yield user_1.default.create({
        email,
        password: hashedPassword,
        stripeCustomerId: customer.id,
        isAdmin: false,
    });
    // creation of JWT token
    const token = yield jsonwebtoken_1.default.sign({ email: newUser.email }, process.env.JWT_SECRET, {
        expiresIn: 360000,
    });
    res.json({
        errors: [],
        data: {
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                stripeCustomerId: customer.id,
            },
        },
    });
}));
// Log in
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // validating if user exists, by checking email in DB
    const user = yield user_1.default.findOne({ email });
    if (!user) {
        return res.json({
            errors: [
                {
                    msg: "Invalid credentials",
                },
            ],
            data: null,
        });
    }
    // compare password to hashed password from user
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.json({
            errors: [
                {
                    msg: "Invalid credentials",
                },
            ],
            data: null,
        });
    }
    // return token if user is found and passwords match
    const token = yield jsonwebtoken_1.default.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: 360000,
    });
    return res.json({
        errors: [],
        data: {
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        },
    });
}));
// route will go through middleware 'checkAuth' first, before
router.get("/me", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email: req.user });
    return res.json({
        errors: [],
        data: {
            user: {
                id: user._id,
                email: user.email,
                stripeCustomerId: user.stripeCustomerId,
                isAdmin: user.isAdmin,
            },
        },
    });
}));
exports.default = router;
