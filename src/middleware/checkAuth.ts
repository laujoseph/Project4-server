import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
// logic for verifying token

// next = goes to the next middleware in this route
export const checkAuth = async (
  req: Request, //incoming request from the client
  res: Response, // response gives us the ability to respond to the client
  next: NextFunction // if everything is fine, go to the next handler
) => {
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
    const user = (await JWT.verify(
      token,
      process.env.JWT_SECRET as string
    )) as { email: string };

    req.user = user.email;
    next();
  } catch (error) {
    return res.status(403).json({
      errors: [
        {
          msg: "Unauthorized",
        },
      ],
    });
  }
  console.log("Middleware passing through");
};
