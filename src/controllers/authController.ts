import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db/db";
import { User } from "../models/User";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user: User) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

export const loginWithGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
         res.status(400).json({ success: false, message: "Google token is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
             res.status(400).json({ success: false, message: "Invalid Google token" });
             return;
        }

        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOne({ where: { email: payload.email } });

        if (!user) {
            user = new User();
            user.email = payload.email;
            user.FirstName = payload.given_name || "Unknown";
            user.LastName = payload.family_name || "Unknown";
            user.googleId = payload.sub;
            user.picture = payload.picture || "";
            await userRepository.save(user);
        }

        const authToken = generateToken(user);

         res.status(200).json({
            success: true,
            message: "Google login successful",
            token: authToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.FirstName,
                lastName: user.LastName,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error("Google Login Error:", error);
         res.status(500).json({ success: false, message: "Error processing Google login" });
    }
};
