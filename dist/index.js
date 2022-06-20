"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const subs_1 = __importDefault(require("./routes/subs"));
const articles_1 = __importDefault(require("./routes/articles"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
// connecting database
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => {
    console.log("Connected to mongoDB");
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use("/auth", auth_1.default);
    app.use("/subs", subs_1.default);
    app.use("/articles", articles_1.default);
    app.listen(8080, () => {
        console.log(`Now listening to port 8080`);
    });
})
    .catch((error) => {
    console.log(error);
    throw new Error(error);
});
