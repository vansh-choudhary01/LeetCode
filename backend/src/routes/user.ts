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

export default router;