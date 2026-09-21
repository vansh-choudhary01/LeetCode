import { Router } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();
router.post("/login", async (req, res, next) => {
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
            });
        }
        else if (user.role !== "admin") {
            return res.status(403).json({
                status: false,
                message: "403 Forbidden (Authorization Failed)"
            });
        }
        const compare = await bcrypt.compare(password, user.password);
        if (!compare || !email) {
            return res.status(400).json({
                status: false,
                message: "credentials incorrect"
            });
        }
        const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            status: true,
            message: "login successfully"
        });
    }
    catch (err) {
        next(err);
    }
});
export default router;
