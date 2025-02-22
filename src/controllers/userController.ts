import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AppDataSource } from "../db/db";
import { generateToken } from "../utils/generateToken";

const getPagination = (page: number, size: string | number) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

const getPagingData = (data: { count: any; rows: any; }, page: string | number, limit: number) => {
    const { count: totalItems, rows: tutorials } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, tutorials, totalPages, currentPage };
};

class userController {
    static async createUser(req: Request, res: Response) {
        try {
            const { FirstName, LastName, Dob, email, password } = req.body;
            const user = new User();
            user.FirstName = FirstName;
            user.LastName = LastName;
            user.Dob = Dob;
            user.email = email;
            user.password = password;
            user.createdAt = new Date();
            user.updatedAt = new Date();

            if (!FirstName) {
                res.status(400).json({ message: "FirstName is required" });
                return;
            }
            if (!LastName) {
                res.status(400).json({ message: "LastName is required" });
                return;
            }
            if (!email) {
                res.status(400).json({ message: "Email is required" });
                return;
            }
            if (!password) {
                res.status(400).json({ message: "password is required" });
                return;
            }
            const workflowRepository = AppDataSource.getRepository(User)
            if (await workflowRepository.findOne({ where: { email } })) {
                res.status(400).json({ message: "User already exists" });
                return;
            }
            await AppDataSource.manager.save(user);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: "Error creating user", error: error });
        }

    }
    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const workflowRepository = AppDataSource.getRepository(User)
            const user = await workflowRepository.findOne(
                {
                    where:
                    {
                        email
                    }
                });
            if (!user) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            if (user?.password !== password) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }
            
            if (user?.status !== 'active') {
                res.status(401).json({ message: "Your actount is not active" });
                return;

            }
            if (user) {
                const token = generateToken(user);
                res.status(200).json({ token });
                return;
            } else {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }
        } catch (error: any) {
            res.status(500).json({ message: "Error logging in", error: error.message });
            return;

        }

    }
    static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workflowRepository = AppDataSource.getRepository(User)
            const limit = 1;
            const offset = 1;
            const [users, count] = await workflowRepository.findAndCount()
            const paginatedData = getPagingData({ count, rows: users }, 0, 1)
            res.status(200).json({ message: "All users", data: paginatedData })
            return;
        } catch (error: any) {
            res.status(500).json({ message: "Failed to Fetch All users", error: error.message });
            return;
        }

    }
    static async getSingleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const workflowRepository = AppDataSource.getRepository(User)

            const existingUser = await workflowRepository.findOne({
                where: {
                    id: id
                }
            });

            if (!existingUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(200).json({ message: "existing user", data: existingUser });
        } catch (error: any) {
            res.status(500).json({ message: "Error fetching user", error: error.message });
        }
    }
    static async updateSingleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { FirstName, LastName, Dob, email, status, type } = req.body;

            const workflowRepository = AppDataSource.getRepository(User);
            const existingUser = await workflowRepository.findOne({
                where: { id: id }
            });

            if (!existingUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            if (FirstName) existingUser.FirstName = FirstName;
            if (LastName) existingUser.LastName = LastName;
            if (Dob) existingUser.Dob = Dob;


            existingUser.updatedAt = new Date();

            await workflowRepository.save(existingUser);
            res.status(200).json({ message: "User updated successfully", data: existingUser });
        } catch (error: any) {
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    }
    static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const workflowRepository = AppDataSource.getRepository(User);

            const existingUser = await workflowRepository.findOne({
                where: { id: id }
            });

            if (!existingUser) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            await workflowRepository.remove(existingUser);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: "Error deleting user", error: error.message });
        }
    }

};


export default userController;
