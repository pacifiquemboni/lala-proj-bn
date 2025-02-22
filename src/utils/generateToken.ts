import jwt from "jsonwebtoken"
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (user: User) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            type: user.type
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
    );
};



