import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
export function authMiddleware(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized"
        });
    }
    const compare = jwt.verify(token, process.env.JWT_SECRET);
    if (!compare || !compare.id) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized"
        });
    }
    const user = prisma.user.findFirst({
        where: {
            id: compare.id
        }
    });
    req.user = user;
    req.isAdmin = compare.role === 'admin';
    next();
}
