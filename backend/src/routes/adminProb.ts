import { Router, type Request, type Response, type NextFunction } from "express";
import prisma from "../lib/prisma.js";
import z from 'zod';

const router = Router();

const bodyValidator = z.object({
    title: z.string(),
    description: z.string(),
    tests: z.array(z.object({
        input: z.any(),
        expected: z.any()
    })),
    functionName: z.string(),
    baseCode: z.object({
        ts: z.string(),
        python: z.string()
    })
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const isAdmin = req.isAdmin;

        if (isAdmin !== true) {
            return res.status(403).json({
                status: false,
                message: "403 Forbidden (Authorization Failed)"
            });
        }

        const validate = bodyValidator.safeParse(body);

        if (!validate.success) {
            return res.status(400).json({
                status: false,
                message: "body validation failed"
            })
        }

        const { title, description, tests, baseCode, functionName } = validate.data;

        const problem = {
            title,
            description,
            tests: {
                create: tests
            },
            functionName: functionName,
            baseCode: baseCode
        }

        await prisma.problem.create({
            data: problem
        });

        return res.status(201).json({
            status: false,
            message: "Problem created successfully"
        })
    } catch (err) {
        next(err)
    }
});

export default router;