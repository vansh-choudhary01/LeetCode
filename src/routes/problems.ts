import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import z from "zod";
import prisma from "../lib/prisma";
import getQueue from "../RabitMQ/db"

const router = Router();

const quaryValidator = z.object({
    page: z.string().default("1"),
    limit: z.string().default("10"),
    solved: z.enum(["true", "false"]).optional(),
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.query;
        const validate = quaryValidator.safeParse(data);

        if (!validate.success) {
            return res.status(400).json({
                status: false,
                message: "query validation failed" + validate.error,
            });
        }

        const { page, limit, solved } = validate.data;
        const skip: number = (parseInt(page) - 1) * parseInt(limit);

        // get data from db
        const [probs, total] = await prisma.$transaction([
            prisma.problem.findMany({
                skip,
                take: parseInt(limit),
                orderBy: { id: "asc" }
            }),
            prisma.problem.count(),
        ])

        return res.status(200).json({
            status: true,
            message: "problems fetched successfully",
            data: { probs, total },
        });
    } catch (err) {
        next(err);
    }
});

const paramValidator = z.object({
    probId: z.string()
});

router.get("/:probId", (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.params;

        const validate = paramValidator.safeParse(params);

        if (!validate.success) {
            return res.status(400).json({
                status: false,
                message: "params validation failed"
            })
        }

        const { probId } = validate.data;

        const prob = prisma.problem.findFirst({
            where: {
                id: parseInt(probId),
            },
        })

        if (!prob) {
            return res.status(404).json({
                status: false,
                message: "problem not found"
            })
        }

        return res.status(200).json({
            status: true,
            message: "problem fetched successfully",
            data: prob,
        });
    } catch (err) {
        next(err);
    }
});

const bodyValidator = z.object({
    language: z.enum(["ts", "python"]),
    code: z.string()
})

router.post("/submission/:probId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.params;
        const body = req.body;

        const validateParams = paramValidator.safeParse(params);
        const validateBody = bodyValidator.safeParse(body);

        if (!validateParams.success || !validateBody.success) {
            return res.status(400).json({
                status: false,
                message: "validation failed"
            })
        }

        const { probId } = validateParams.data;
        const { language, code } = validateBody.data;

        const prob = await prisma.problem.findFirst({
            where: {
                id: parseInt(probId),
            },
        })

        if (!prob) {
            return res.status(404).json({
                status: false,
                message: "problem not found"
            })
        }

        // send to queue for execution in sandbox
        const queue = await getQueue();

        queue.sendToQueue(
            "tasks",
            Buffer.from(JSON.stringify({ language, code, probId })),
            { persistent: true }
        );

        return res.status(200).json({
            status: true,
            message: "successfully submitted, executing in background"
        });
    } catch (err) {
        next(err)
    }
})

export default router;
