import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";
const router = express.Router();

// Update Password
router.put("/changepass", async (req, res) => {
  const newPassword = await bcrypt.hash(req.body.newPassword, 10);
  const email = req.body.email;
  console.log(newPassword);
  console.log(email);
  try {
    await User.findOneAndUpdate({ email: email }, { password: newPassword });
  } catch (err) {
    console.log(err);
  }
});

// Sign up
router.post(
  "/signup",
  body("email").isEmail().withMessage("The email is invalid"),
  body("password").isLength({ min: 5 }).withMessage("The password is invalid"),
  async (req, res) => {
    // returns an array of errors
    const validationErrors = validationResult(req);
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
    const user = await User.findOne({ email });
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

    const hashedPassword = await bcrypt.hash(password, 10);

    // creating stripe customer here
    const customer = await stripe.customers.create(
      {
        email,
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    const newUser = await User.create({
      email,
      password: hashedPassword,
      stripeCustomerId: customer.id,
      isAdmin: false,
    });
    // creation of JWT token
    const token = await JWT.sign(
      { email: newUser.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: 360000,
      }
    );
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
  }
);

// Log in
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // validating if user exists, by checking email in DB
  const user = await User.findOne({ email });

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
  const isMatch = await bcrypt.compare(password, user.password);

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
  const token = await JWT.sign(
    { email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: 360000,
    }
  );

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
});
// route will go through middleware 'checkAuth' first, before
router.get("/me", checkAuth, async (req, res) => {
  const user = await User.findOne({ email: req.user });

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
});
export default router;
