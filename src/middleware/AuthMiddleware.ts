import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: "Login to perform this action" });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        (req as any).user = decoded;
        const { userId } = req.params;
        if (userId && decoded.id !== parseInt(userId)) {
            if (decoded.type !== 'admin') {
                res.status(403).json({ message: "Unauthorized access to this user" });
                return;
            }

        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

export const checkType = (requiredType: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (user?.type !== requiredType) {
                res.status(403).json({ message: "Unauthorized access" });
                return;
            }
            next();
        } catch (error) {
            res.status(401).json({ message: "Authentication failed, Login to perform this action" });
            return;
        }
    };
};


