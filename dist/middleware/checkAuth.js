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
exports.checkAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// logic for verifying token
// next = goes to the next middleware in this route
const checkAuth = (req, //incoming request from the client
res, // response gives us the ability to respond to the client
next // if everything is fine, go to the next handler
) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("authorization");
    if (!token) {
        // 403 = forbidden
        return res.status(403).json({
            errors: [
                {
                    msg: "Unauthorized",
                },
            ],
        });
    }
    // splits the bearer and actual token
    token = token.split(" ")[1];
    // JWT.verify throws an error if token is invalid
    // if token is valid, return payload
    try {
        const user = (yield jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET));
        req.user = user.email;
        next();
    }
    catch (error) {
        return res.status(403).json({
            errors: [
                {
                    msg: "Unauthorized",
                },
            ],
        });
    }
    console.log("Middleware passing through");
});
exports.checkAuth = checkAuth;
