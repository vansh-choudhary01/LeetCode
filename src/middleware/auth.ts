import {type Request, type Response, type NextFunction} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../lib/prisma";

type AuthRequest = Request & {
    user?: any
}
type JwtRes = JwtPayload & {id: any};


export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized"
        })
    }

    const compare = jwt.verify(token, process.env.JWT_SECRET as string) as JwtRes;

    if (!compare || !compare.id) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized"
        })
    }

    const user= prisma.user.findFirst({
        where: {
            id: compare.id
        }
    })

    req.user = user;

    next();
}