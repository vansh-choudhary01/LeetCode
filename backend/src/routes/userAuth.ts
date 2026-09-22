import { Router, type Request, type Response, type NextFunction } from "express";
import z from "zod"
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const router = Router();


const registerValidator = z.object(
    {
        name: z.string(),
        email: z.email(),
        password: z.string()
    });
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;

        const validate = registerValidator.safeParse(body);

        if (validate.success === false) {
            return res.status(400).json({
                success: false,
                message: "Invalid Inputs"
            })
        }

        const { name, email, password } = validate.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "user"
            }
        });

        const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET as string, { expiresIn: "7d" })

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
            path: "*"
        })

        return res.status(201).json({
            success: true,
            message: "User Created Successfully"
        })
    } catch (err) {
        next(err)
    }
})

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "credentials incorrect"
            })
        }

        const compare = await bcrypt.compare(password, user.password);

        if (!compare || !email) {
            return res.status(400).json({
                status: false,
                message: "credentials incorrect"
            })
        }

        const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
            path: "*"
        });

        return res.status(200).json({
            status: true,
            message: "login successfully"
        })
    } catch (err) {
        next(err)
    }
})

export default router;