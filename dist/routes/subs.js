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
const user_1 = __importDefault(require("../models/user"));
const stripe_1 = require("../utils/stripe");
const checkAuth_1 = require("../middleware/checkAuth");
const router = express_1.default.Router();
// only show the prices if user is authenticated
router.get("/prices", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prices = yield stripe_1.stripe.prices.list({
        apiKey: process.env.STRIPE_SECRET_KEY,
    });
    return res.json(prices);
}));
// stripe checkout route
// creates a subscription session, link item to user.
router.post("/session", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email: req.user });
    const session = yield stripe_1.stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: req.body.priceId,
                quantity: 1,
            },
        ],
        success_url: `http://localhost:3000/articles`,
        cancel_url: `http://localhost:3000/article-plans`,
        customer: user.stripeCustomerId,
    }, {
        apiKey: process.env.STRIPE_SECRET_KEY,
    });
    return res.json(session);
}));
exports.default = router;
