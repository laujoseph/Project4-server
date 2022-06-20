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
const article_1 = __importDefault(require("../models/article"));
const router = express_1.default.Router();
router.get("/", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // user has stripe customer id
    const user = yield user_1.default.findOne({ email: req.user });
    // this gets all the subscriptions of this particular customer
    const subscriptions = yield stripe_1.stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        expand: ["data.default_payment_method"],
    }, {
        apiKey: process.env.STRIPE_SECRET_KEY,
    });
    // do not return articles if user has no subscription plan
    if (!subscriptions.data.length)
        return res.json([]);
    //@ts-ignore
    const plan = subscriptions.data[0].plan.nickname;
    // conditionally render articles based on user plan
    if (plan === "Basic") {
        const articles = yield article_1.default.find({ access: "Basic" });
        return res.json(articles);
    }
    else if (plan === "Standard") {
        const articles = yield article_1.default.find({
            // get all articles that have access that are either basic or standard
            access: { $in: ["Basic", "Standard"] },
        });
        return res.json(articles);
    }
    else {
        const articles = yield article_1.default.find({});
        return res.json(articles);
    }
    res.json(plan);
}));
// Update Article
router.put("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const content = req.body.content;
    const access = req.body.access;
    const category = req.body.category;
    const instructor = req.body.instructor;
    const bannerUrl = req.body.bannerUrl;
    console.log(instructor);
    try {
        yield article_1.default.findOneAndUpdate({ instructor: instructor }, {
            title: title,
            imageUrl: imageUrl,
            content: content,
            access: access,
            category: category,
            bannerUrl: bannerUrl,
            instructor: instructor,
        });
    }
    catch (err) {
        console.log(err);
    }
}));
// Create Article
router.post("/create", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({ email: req.user });
    const newArticle = new article_1.default({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        content: req.body.content,
        access: req.body.access,
        category: req.body.category,
        bannerUrl: req.body.bannerUrl,
        instructor: req.body.instructor,
    });
    try {
        yield newArticle.save();
        res.send("Article Created");
    }
    catch (err) {
        console.log(err);
    }
}));
// Delete Article
router.post("/delete", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checkInstructor = article_1.default.findOne({ instructor: req.body.instructor });
    if (!checkInstructor) {
        res.send("error");
    }
    else {
        try {
            yield article_1.default.findOneAndRemove({ instructor: req.body.instructor });
        }
        catch (err) {
            console.log(err);
            res.json("Unable to fulfill request");
        }
    }
}));
// Fetch filtered category articles
router.get("/:category", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let category = req.params.category;
    const user = yield user_1.default.findOne({ email: req.user });
    // this gets all the subscriptions of this particular customer
    const subscriptions = yield stripe_1.stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        expand: ["data.default_payment_method"],
    }, {
        apiKey: process.env.STRIPE_SECRET_KEY,
    });
    // do not return articles if user has no subscription plan
    if (!subscriptions.data.length)
        return res.json([]);
    //@ts-ignore
    const plan = subscriptions.data[0].plan.nickname;
    // conditionally render articles based on user plan
    if (plan === "Basic") {
        const articles = yield article_1.default.find({
            access: "Basic",
            category: category,
        });
        return res.json(articles);
    }
    else if (plan === "Standard") {
        const articles = yield article_1.default.find({
            // get all articles that have access that are either basic or standard
            access: { $in: ["Basic", "Standard"] },
            category: category,
        });
        return res.json(articles);
    }
    else {
        const articles = yield article_1.default.find({ category: category });
        return res.json(articles);
    }
    // res.json(plan);
    // console.log(articles);
}));
// get articles for articleDetails page
router.get("/course/:title", checkAuth_1.checkAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let title = req.params.title.replace("%20", " ");
    console.log(title);
    const user = yield user_1.default.findOne({ email: req.user });
    // this gets all the subscriptions of this particular customer
    const subscriptions = yield stripe_1.stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        expand: ["data.default_payment_method"],
    }, {
        apiKey: process.env.STRIPE_SECRET_KEY,
    });
    // do not return articles if user has no subscription plan
    if (!subscriptions.data.length)
        return res.json([]);
    //@ts-ignore
    const plan = subscriptions.data[0].plan.nickname;
    const articles = yield article_1.default.find({ title: title });
    return res.json(articles);
    // console.log(articles);
}));
exports.default = router;
