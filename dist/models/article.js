"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const articleSchema = new mongoose_2.Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    access: {
        type: String,
        enum: ["Basic", "Standard", "Premium"],
        required: true,
    },
    category: {
        type: String,
        enum: ["Food", "Music", "Sports"],
        required: true,
    },
    bannerUrl: {
        type: String,
    },
    instructor: {
        type: String,
        required: true,
    },
});
exports.default = mongoose_1.default.model("Article", articleSchema);
