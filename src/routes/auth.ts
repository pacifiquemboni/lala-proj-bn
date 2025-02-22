// import express, { Request, Response } from 'express';
// import axios from 'axios';
// import dotenv from 'dotenv';
// import { AppDataSource } from '../db/db';
// import { generateToken } from '../utils/generateToken';
// import { User } from '../models/User';

// dotenv.config();

// const router = express.Router();

// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = 'http://localhost:3007/google/auth/google/callback';

// // Initiates the Google Login flow
// router.get('/auth/google', (req: Request, res: Response) => {
//     const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
//     res.redirect(url);
// });

// // Callback URL for handling the Google Login response
// // Google Callback route for handling the login and user creation
// router.get('/auth/google/callback', async (req: Request, res: Response) => {
//     const { code } = req.query;

//     try {
//         // Exchange the authorization code for an access token
//         const { data } = await axios.post('https://oauth2.googleapis.com/token', {
//             client_id: CLIENT_ID,
//             client_secret: CLIENT_SECRET,
//             code,
//             redirect_uri: REDIRECT_URI,
//             grant_type: 'authorization_code',
//         });

//         const { access_token } = data;

//         // Fetch user profile from Google
//         const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
//             headers: { Authorization: `Bearer ${access_token}` },
//         });

//         console.log('User Profile:', profile);
//         console.log('Access Token:', access_token);

//         // Check if user already exists in the database
//         const workflowRepository = AppDataSource.getRepository(User);
//         let user = await workflowRepository.findOne({
//             where: { email: profile.email },
//         });

//         // If user doesn't exist, create a new user
//         if (!user) {
//             user = new User();
//             user.FirstName = profile.given_name || 'N/A';
//             user.LastName = profile.family_name || 'N/A';
//             user.email = profile.email;
//             user.picture = profile.picture,
//                 user.type = "renters",
//                 user.isGoogleAuth = true,
//                 user.lastLogin = new Date(),
//                 user.password = '';  // Set a placeholder for the password or hash an auto-generated password
//             user.createdAt = new Date();
//             user.updatedAt = new Date();

//             await AppDataSource.manager.save(user);
//         }

//         // Generate a token for the user
//         const token = generateToken(user);
//         console.log('Token:', token);

//         // Send the token in the response (you could store it in a cookie or return it in JSON)
//         res.json({ message: 'Login successful', token });

//     } catch (error: any) {
//         console.error('Error:', error.response ? error.response.data.error : error.message);
//         res.redirect('/login');
//     }
// });
// // Logout route
// router.get('/logout', (req: Request, res: Response) => {
//     // Code to handle user logout
//     res.redirect('/login');
// });

// export default router;