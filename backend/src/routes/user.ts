import { Router, type Request, type Response, type NextFunction } from "express";

type User = {
  id: number
  name: string
  email: string
  password?: string
  role: 'admin' | 'user'
}

const router = Router();

router.get("/me", (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    delete user["password"];

    return res.status(200).json({
        status: true,
        message: "user details fetched successfully",
        data: user
    })
})

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    });

    return res.status(200).json({
        success: true,
        message: "user logged out successfully"
    })
})

export default router;